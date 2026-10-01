import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true, maxlength: 1000 },
  by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  byName: String,
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const leadSchema = new mongoose.Schema({
  state: { type: String, trim: true },
  district: { type: String, required: true, index: true, trim: true },
  sourceTimestamp: Date,
  schoolName: { type: String, required: true, trim: true },
  contactPerson: { type: String, trim: true },
  mobile: { type: String, trim: true },
  email: { type: String, trim: true },
  applicationNo: { type: String, required: true, unique: true, index: true },
  status: { type: String, default: 'New', index: true, trim: true, maxlength: 40 },
  tags: [{ type: String, trim: true, maxlength: 30 }],
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
  callCount: { type: Number, default: 0, min: 0 },
  lastCalledAt: Date,
  lastContactedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  followUpAt: Date,
  notes: [noteSchema]
}, { timestamps: true });

leadSchema.index({ schoolName: 'text', contactPerson: 'text', mobile: 'text', email: 'text', applicationNo: 'text' });
leadSchema.index({ district: 1, status: 1 });
export default mongoose.model('Lead', leadSchema);
