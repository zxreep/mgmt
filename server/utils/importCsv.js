import fs from 'node:fs';
import csv from 'csv-parser';
import Lead from '../models/Lead.js';

export async function importCsv(filePath, onProgress = () => {}) {
  if (!fs.existsSync(filePath)) throw new Error(`CSV not found: ${filePath}`);
  let processed = 0, upserted = 0, modified = 0, batch = [];
  async function flush() {
    if (!batch.length) return;
    const result = await Lead.bulkWrite(batch, { ordered: false });
    upserted += result.upsertedCount; modified += result.modifiedCount; batch = []; onProgress({ processed, upserted, modified });
  }
  const stream = fs.createReadStream(filePath).pipe(csv());
  for await (const row of stream) {
    if (!row.Application_No || !row.District || !row.School_Name) continue;
    batch.push({ updateOne: { filter: { applicationNo: row.Application_No.trim() }, update: { $setOnInsert: {
      state: row.State?.trim(), district: row.District.trim(), sourceTimestamp: row.Timestamp ? new Date(row.Timestamp) : null,
      schoolName: row.School_Name.trim(), contactPerson: row.Contact_Person?.trim(), mobile: row.Mobile?.trim(),
      email: row.Email?.trim(), applicationNo: row.Application_No.trim()
    } }, upsert: true } });
    processed++; if (batch.length >= 500) await flush();
  }
  await flush(); return { processed, upserted, modified };
}
