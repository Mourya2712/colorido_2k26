const { Client } = require('pg');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config({ path: 'server/.env' });

function normalizeTimeForDb(timeStr) {
  if (!timeStr) return null;
  const s = String(timeStr).trim();
  const match12 = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = match12[2];
    const ampm = match12[4].toUpperCase();
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${m}:00`;
  }
  const match24 = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (match24) {
    return `${String(parseInt(match24[1], 10)).padStart(2, '0')}:${match24[2]}:00`;
  }
  return s;
}

async function testCreateAndEditEvent() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  console.log('Connected to Supabase PostgreSQL!');

  // Lookup Dance category UUID
  const catRes = await client.query("SELECT id, name FROM event_categories WHERE name = 'Dance' LIMIT 1");
  const cat = catRes.rows[0];
  console.log('Using category:', cat);

  const testId = crypto.randomUUID();
  const testSlug = `test-verify-event-${Date.now()}`;
  const startTime = normalizeTimeForDb('10:30 AM');
  const endTime = normalizeTimeForDb('01:45 PM');

  // Test INSERT
  const insertSql = `
    INSERT INTO events
      (id, slug, category_id, category_name, name, type, tagline, short_description,
       description, rules, venue, schedule_date, start_time, end_time, registration_type,
       min_team_size, max_team_size, team_size_label, gender, is_active, is_registration_open,
       registration_deadline, requires_audio, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, TRUE, $20, $21, $22, NOW())
    RETURNING *
  `;
  const insertParams = [
    testId, testSlug, cat.id, cat.name, 'Temporary Verification Test Event', 'cultural',
    'Verification Tagline', 'Short description for verify test',
    'Detailed description for verify test', JSON.stringify(['Rule 1', 'Rule 2']),
    'Main Stage OAT', '2026-02-27', startTime, endTime, 'individual',
    1, 1, 'Individual Solo', 'all', true, '2026-10-15T23:59:59.000Z', false
  ];

  const insertRes = await client.query(insertSql, insertParams);
  console.log('Inserted test event successfully! ID:', insertRes.rows[0].id);

  // Test UPDATE
  const updateSql = `
    UPDATE events SET
      name = $1,
      start_time = $2,
      schedule_date = $3
    WHERE id::text = $4 OR slug = $4
    RETURNING *
  `;
  const updateRes = await client.query(updateSql, ['Updated Temporary Verification Test Event', normalizeTimeForDb('03:15 PM'), '2026-02-28', testId]);
  console.log('Updated test event successfully! New name & time:', updateRes.rows[0].name, updateRes.rows[0].start_time);

  // Clean up the temporary test event
  await client.query('DELETE FROM events WHERE id = $1', [testId]);
  console.log('Cleaned up test event!');

  await client.end();
}

testCreateAndEditEvent().catch(console.error);
