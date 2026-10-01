import 'dotenv/config';
import path from 'node:path';
import { connectDB } from '../config/db.js';
import { importCsv } from '../utils/importCsv.js';
import mongoose from 'mongoose';
try {
  await connectDB();
  const result = await importCsv(path.resolve(process.argv[2] || 'inspire_haryana_private_schools.csv'), p => console.log(`Processed ${p.processed}...`));
  console.log('Import complete:', result);
} catch (error) { console.error(error); process.exitCode = 1; }
finally { await mongoose.disconnect(); }
