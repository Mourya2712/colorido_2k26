const { Pool } = require('pg');
require('dotenv').config({ path: 'server/.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  const cols = await pool.query("SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'registrations'");
  console.log('Columns:', cols.rows.map(c => `${c.column_name}: ${c.data_type}`));
  
  const constraints = await pool.query("SELECT conname, pg_get_constraintdef(c.oid) FROM pg_constraint c WHERE conrelid = 'registrations'::regclass");
  console.log('Constraints:', constraints.rows);

  const sample = await pool.query("SELECT id, registration_number, status, notes FROM registrations LIMIT 3");
  console.log('Sample rows:', sample.rows);

  await pool.end();
}

check().catch(console.error);
