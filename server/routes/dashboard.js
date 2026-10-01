import { Router } from 'express';
import Activity from '../models/Activity.js';
import Lead from '../models/Lead.js';
import { protect, leadScope } from '../middleware/auth.js';
const router = Router(); router.use(protect);

router.get('/', async (req, res) => {
  const scope = leadScope(req.user);
  const startToday = new Date(); startToday.setHours(0, 0, 0, 0);
  const weekAgo = new Date(Date.now() - 6 * 864e5); weekAgo.setHours(0,0,0,0);
  const activityScope = req.user.role === 'admin' ? {} : { user: req.user._id };
  const [total, interested, converted, dueFollowups, totalCalls, callsToday, whatsappToday, statusBreakdown, districtBreakdown, recent, trend] = await Promise.all([
    Lead.countDocuments(scope), Lead.countDocuments({ ...scope, status: 'Interested' }), Lead.countDocuments({ ...scope, status: 'Converted' }),
    Lead.countDocuments({ ...scope, followUpAt: { $lte: new Date() }, status: { $nin: ['Converted', 'Not interested'] } }),
    Activity.countDocuments({ ...activityScope, type: 'call' }),
    Activity.countDocuments({ ...activityScope, type: 'call', createdAt: { $gte: startToday } }),
    Activity.countDocuments({ ...activityScope, type: 'whatsapp', createdAt: { $gte: startToday } }),
    Lead.aggregate([{ $match: scope }, { $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Lead.aggregate([{ $match: scope }, { $group: { _id: '$district', total: { $sum: 1 }, interested: { $sum: { $cond: [{ $eq: ['$status', 'Interested'] }, 1, 0] } } } }, { $sort: { total: -1 } }]),
    Activity.find(activityScope).sort({ createdAt: -1 }).limit(10).lean(),
    Activity.aggregate([{ $match: { ...activityScope, type: { $in: ['call', 'whatsapp'] }, createdAt: { $gte: weekAgo } } }, { $group: { _id: { day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Kolkata' } }, type: '$type' }, count: { $sum: 1 } } }, { $sort: { '_id.day': 1 } }])
  ]);
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekAgo.getTime() + i*864e5); return d.toISOString().slice(0,10); });
  const activityTrend = days.map(date => ({ date, calls: trend.find(x=>x._id.day===date&&x._id.type==='call')?.count||0, whatsapp: trend.find(x=>x._id.day===date&&x._id.type==='whatsapp')?.count||0 }));
  res.json({ stats: { total, interested, converted, dueFollowups, totalCalls, callsToday, whatsappToday }, statusBreakdown: statusBreakdown.map(x=>({name:x._id,value:x.count})), districtBreakdown: districtBreakdown.map(x=>({district:x._id,total:x.total,interested:x.interested})), recent, activityTrend });
});
export default router;
