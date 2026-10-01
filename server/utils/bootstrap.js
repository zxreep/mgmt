import User from '../models/User.js';
import Setting from '../models/Setting.js';

export async function bootstrap() {
  const username = process.env.ADMIN_USER?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    console.warn('ADMIN_USER/ADMIN_PASSWORD not set; admin bootstrap skipped');
  } else {
    let admin = await User.findOne({ username }).select('+passwordHash');
    if (!admin) {
      admin = await User.create({ name: process.env.ADMIN_NAME || 'Sales Admin', username, passwordHash: await User.hashPassword(password), role: 'admin' });
      console.log(`Admin account created: ${username}`);
    } else if (admin.role !== 'admin') { admin.role = 'admin'; admin.active = true; await admin.save(); }
  }
  await Setting.updateOne({ key: 'statuses' }, { $setOnInsert: { value: ['New', 'Contacted', 'Interested', 'Follow up', 'Converted', 'Not interested', 'No response'] } }, { upsert: true });
}
