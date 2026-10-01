import { Router } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
const router = Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many login attempts. Try again later.' } });

router.post('/login', loginLimiter, async (req, res) => {
  const username = String(req.body.username || '').trim().toLowerCase();
  const user = await User.findOne({ username }).select('+passwordHash');
  if (!user || !user.active || !(await user.checkPassword(String(req.body.password || '')))) return res.status(401).json({ message: 'Invalid username or password' });
  user.lastLoginAt = new Date(); await user.save();
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 864e5 });
  res.json({ user: user.toJSON() });
});
router.post('/logout', (req, res) => { res.clearCookie('token'); res.json({ ok: true }); });
router.get('/me', protect, (req, res) => res.json({ user: req.user }));
router.put('/password', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!(await user.checkPassword(String(req.body.currentPassword || '')))) return res.status(400).json({ message: 'Current password is incorrect' });
  if (String(req.body.newPassword || '').length < 8) return res.status(400).json({ message: 'New password must have at least 8 characters' });
  user.passwordHash = await User.hashPassword(req.body.newPassword); await user.save(); res.json({ message: 'Password updated' });
});
export default router;
