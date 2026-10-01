import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  type: { type: String, enum: ['call', 'status', 'note', 'whatsapp', 'assignment', 'lead_update'], required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  userName: String,
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', index: true },
  leadName: String,
  district: { type: String, index: true },
  detail: String,
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });
schema.index({ createdAt: -1 });
export default mongoose.model('Activity', schema);
