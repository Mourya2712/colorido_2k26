const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: 'server/.env' });

async function checkEventsTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  console.log('Connected to Supabase PostgreSQL!');

  const cols = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'events'
    ORDER BY ordinal_position
  `);
  console.log('Events table columns:', cols.rows.map(r => `${r.column_name} (${r.data_type})`));

  const sample = await client.query('SELECT id, slug, category_id, category_name, name, start_time, end_time, schedule_date FROM events LIMIT 3');
  console.log('Sample events in Supabase:', sample.rows);

  await client.end();
}

checkEventsTable().catch(console.error);
