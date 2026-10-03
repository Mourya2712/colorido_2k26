const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: 'server/.env' });

async function checkDb() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  console.log('Connected to Supabase PostgreSQL!');

  // Check columns of registrations table
  const cols = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'registrations'
    ORDER BY ordinal_position
  `);
  console.log('Registrations columns:', cols.rows.map(r => `${r.column_name} (${r.data_type})`));

  // Check constraints on registrations table
  const constraints = await client.query(`
    SELECT conname, contype, pg_get_constraintdef(c.oid)
    FROM pg_constraint c
    JOIN pg_namespace n ON n.oid = c.connamespace
    WHERE conrelid = 'registrations'::regclass
  `);
  console.log('Constraints on registrations:', constraints.rows);

  // Check unique indexes
  const indexes = await client.query(`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'registrations'
  `);
  console.log('Indexes on registrations:', indexes.rows);

  // Check current row count of registrations
  const countRes = await client.query('SELECT COUNT(*) as count FROM registrations');
  console.log('Current registrations count in Supabase:', countRes.rows[0].count);

  const sampleRows = await client.query('SELECT id, registration_number, email, roll_number, event_id, event_name FROM registrations LIMIT 5');
  console.log('Sample registrations in Supabase:', sampleRows.rows);

  await client.end();
}

checkDb().catch(console.error);
