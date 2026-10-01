import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function protect(req, res, next) {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ message: 'Please sign in to continue' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user || !user.active) return res.status(401).json({ message: 'Account is unavailable' });
    req.user = user;
    next();
  } catch { res.status(401).json({ message: 'Session expired. Please sign in again.' }); }
}

export function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
}

export function leadScope(user) {
  if (user.role === 'admin') return {};
  const or = [];
  if (user.assignedDistricts?.length) or.push({ district: { $in: user.assignedDistricts } });
  or.push({ assignedTo: user._id });
  return { $or: or };
}
