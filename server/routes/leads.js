import { Router } from 'express';
import mongoose from 'mongoose';
import Lead from '../models/Lead.js';
import Activity from '../models/Activity.js';
import Setting from '../models/Setting.js';
import { protect, leadScope } from '../middleware/auth.js';
const router = Router();
router.use(protect);

function scopedQuery(user, extra = {}) {
  const scope = leadScope(user);
  return Object.keys(scope).length ? { $and: [scope, extra] } : extra;
}
function cleanRegex(value) { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
async function canAccess(user, id) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Lead.findOne(scopedQuery(user, { _id: id }));
}
async function log(req, lead, type, detail, metadata) {
  return Activity.create({ type, user: req.user._id, userName: req.user.name, lead: lead._id, leadName: lead.schoolName, district: lead.district, detail, metadata });
}

router.get('/', async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1), limit = Math.min(100, Math.max(10, Number(req.query.limit) || 25));
  const filter = {};
  if (req.query.district) filter.district = req.query.district;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.assignedTo && req.user.role === 'admin' && mongoose.isValidObjectId(req.query.assignedTo)) filter.assignedTo = req.query.assignedTo;
  if (req.query.followup === 'due') filter.followUpAt = { $lte: new Date() };
  if (req.query.search) {
    const rx = new RegExp(cleanRegex(req.query.search).slice(0, 100), 'i');
    filter.$or = [{ schoolName: rx }, { contactPerson: rx }, { mobile: rx }, { email: rx }, { applicationNo: rx }];
  }
  const query = scopedQuery(req.user, filter);
  const [leads, total] = await Promise.all([
    Lead.find(query).populate('assignedTo', 'name username').sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Lead.countDocuments(query)
  ]);
  res.json({ leads, total, page, pages: Math.ceil(total / limit) });
});

router.get('/meta', async (req, res) => {
  const scope = leadScope(req.user);
  const [districts, setting] = await Promise.all([
    Lead.aggregate([{ $match: scope }, { $group: { _id: '$district', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Setting.findOne({ key: 'statuses' }).lean()
  ]);
  res.json({ districts: districts.map(x => ({ name: x._id, count: x.count })), statuses: setting?.value || [] });
});

router.get('/:id', async (req, res) => {
  const lead = await Lead.findOne(scopedQuery(req.user, { _id: req.params.id })).populate('assignedTo', 'name username').populate('notes.by', 'name');
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  const activities = await Activity.find({ lead: lead._id }).sort({ createdAt: -1 }).limit(30).lean();
  res.json({ lead, activities });
});

router.patch('/:id', async (req, res) => {
  const lead = await canAccess(req.user, req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  const allowed = ['status', 'tags', 'followUpAt', 'contactPerson', 'mobile', 'email'];
  const changed = [];
  for (const key of allowed) if (req.body[key] !== undefined) { lead[key] = req.body[key] || (key === 'tags' ? [] : null); changed.push(key); }
  await lead.save();
  await log(req, lead, changed.includes('status') ? 'status' : 'lead_update', changed.includes('status') ? `Marked ${lead.status}` : `Updated ${changed.join(', ')}`);
  res.json({ lead });
});

router.post('/:id/calls', async (req, res) => {
  const lead = await canAccess(req.user, req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  lead.callCount += 1; lead.lastCalledAt = new Date(); lead.lastContactedBy = req.user._id;
  if (lead.status === 'New') lead.status = 'Contacted';
  if (req.body.note) lead.notes.push({ text: req.body.note, by: req.user._id, byName: req.user.name });
  await lead.save(); await log(req, lead, 'call', req.body.note || 'Call logged');
  res.json({ lead, message: 'Call logged' });
});

router.post('/:id/whatsapp', async (req, res) => {
  const lead = await canAccess(req.user, req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  await log(req, lead, 'whatsapp', req.body.templateTitle ? `Opened: ${req.body.templateTitle}` : 'WhatsApp opened');
  res.json({ ok: true });
});

router.post('/:id/notes', async (req, res) => {
  const lead = await canAccess(req.user, req.params.id);
  const text = String(req.body.text || '').trim();
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  if (!text) return res.status(400).json({ message: 'Note cannot be empty' });
  lead.notes.push({ text, by: req.user._id, byName: req.user.name }); await lead.save(); await log(req, lead, 'note', text.slice(0, 160));
  res.json({ lead });
});
export default router;
