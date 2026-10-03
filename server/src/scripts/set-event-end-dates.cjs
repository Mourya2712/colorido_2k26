const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function setEventEndDates() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to Supabase PostgreSQL...');

  // Ensure end_date column exists
  await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS end_date DATE;');
  console.log('✓ end_date column ensured.');

  // Set the END DATE for ALL existing COLORIDO 2K26 events to: 08-10-2026 (2026-10-08 in DB date format)
  // IMPORTANT:
  // - Do NOT change the event start dates/times.
  // - Do NOT change event names, categories, venues, registration rules, or other event information.
  // - Only update the END DATE.
  // - Apply this to ALL existing events in the database.
  const updateRes = await client.query("UPDATE events SET end_date = '2026-10-08'");
  console.log(`✓ Updated ${updateRes.rowCount} events with end_date = 2026-10-08`);

  // Verify
  const verifyRes = await client.query("SELECT id, name, schedule_date, start_time, end_time, end_date FROM events ORDER BY name ASC");
  console.log('Verification count:', verifyRes.rows.length);
  for (const r of verifyRes.rows) {
    const endD = r.end_date instanceof Date ? r.end_date.toISOString().slice(0, 10) : r.end_date;
    console.log(`- ${r.name}: end_date = ${endD} | start_time = ${r.start_time} | schedule_date = ${r.schedule_date}`);
  }

  await client.end();
}

setEventEndDates().catch(err => {
  console.error('Error updating end dates:', err);
  process.exit(1);
});
