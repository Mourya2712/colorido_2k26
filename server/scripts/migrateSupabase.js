const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function migrateSupabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  console.log('Connected to Supabase');

  // 1. Add category_name column to events if not exists
  try {
    await client.query("ALTER TABLE events ADD COLUMN category_name VARCHAR(200)");
    console.log('Added category_name column to events');
  } catch(e) { console.log('category_name already exists or error:', e.message); }

  // 2. Add schedule_date column to events if not exists (alias for event_date)
  try {
    await client.query("ALTER TABLE events ADD COLUMN schedule_date TEXT");
    console.log('Added schedule_date column to events');
  } catch(e) { console.log('schedule_date already exists or error:', e.message); }

  // 3. Add is_registration_open to events if not exists
  try {
    await client.query("ALTER TABLE events ADD COLUMN is_registration_open BOOLEAN DEFAULT TRUE");
    console.log('Added is_registration_open column to events');
  } catch(e) { console.log('is_registration_open already exists or error:', e.message); }

  // 4. Populate category_name from event_categories join
  const result = await client.query(
    "UPDATE events SET category_name = ec.name FROM event_categories ec WHERE events.category_id = ec.id RETURNING events.id, events.slug, events.category_name"
  );
  console.log('Updated category_name for', result.rowCount, 'events');
  console.log('Sample:', result.rows.slice(0,3).map(r => r.slug + ':' + r.category_name));

  // 5. Populate schedule_date from event_date
  const sd = await client.query("UPDATE events SET schedule_date = event_date::text WHERE event_date IS NOT NULL");
  console.log('Updated schedule_date for', sd.rowCount, 'events');

  // 6. Add is_active column to schedule_items if not exists
  try {
    await client.query("ALTER TABLE schedule_items ADD COLUMN is_active BOOLEAN DEFAULT TRUE");
    console.log('Added is_active to schedule_items');
  } catch(e) { console.log('schedule_items.is_active already exists or error:', e.message); }

  // 7. Check if events.is_active is boolean (Supabase) -- fix queries that use `= 1`
  // We'll add a computed integer view or just note that Supabase uses boolean
  const evCnt = await client.query("SELECT COUNT(*) FROM events WHERE is_active = TRUE");
  console.log('Active events count:', evCnt.rows[0].count);

  // 8. Check registrations
  const regCnt = await client.query("SELECT COUNT(*) FROM registrations");
  console.log('Total registrations:', regCnt.rows[0].count);

  await client.end();
  console.log('Migration complete!');
}

migrateSupabase().catch(e => { console.error('Migration error:', e); process.exit(1); });
