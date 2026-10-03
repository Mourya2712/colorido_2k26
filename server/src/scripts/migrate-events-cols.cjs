const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: 'server/.env' });

async function migrateEventsColumns() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  console.log('Connected to Supabase PostgreSQL!');

  await client.query(`
    ALTER TABLE events ADD COLUMN IF NOT EXISTS team_size_label text;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_deadline text;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_deadline_updated_at text;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS requires_audio boolean DEFAULT false;
  `);

  console.log('Columns added successfully to events table!');

  const cols = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'events'
    AND column_name IN ('team_size_label', 'registration_deadline', 'registration_deadline_updated_at', 'requires_audio')
  `);
  console.log('Verified columns in events:', cols.rows);

  await client.end();
}

migrateEventsColumns().catch(console.error);
