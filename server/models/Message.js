import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  body: { type: String, required: true, trim: true, maxlength: 2000 },
  label: { type: String, default: 'General', trim: true, maxlength: 40 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  ownerName: String,
  shared: { type: Boolean, default: false }
}, { timestamps: true });
export default mongoose.model('Message', schema);
