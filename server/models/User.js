import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 50 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  assignedDistricts: [{ type: String, trim: true }],
  active: { type: Boolean, default: true },
  lastLoginAt: Date
}, { timestamps: true });

userSchema.methods.checkPassword = function(password) { return bcrypt.compare(password, this.passwordHash); };
userSchema.statics.hashPassword = function(password) { return bcrypt.hash(password, 12); };
userSchema.set('toJSON', { transform: (_, obj) => { delete obj.passwordHash; return obj; } });
export default mongoose.model('User', userSchema);
