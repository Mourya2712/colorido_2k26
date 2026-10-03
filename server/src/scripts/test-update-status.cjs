const { Pool } = require('pg');
require('dotenv').config({ path: 'server/.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function test() {
  const rowRes = await pool.query("SELECT id, registration_number, status, notes FROM registrations LIMIT 1");
  const row = rowRes.rows[0];
  console.log('Testing with registration:', row);

  // Test updating status by id
  console.log('\n--- Test 1: Update status to confirmed by id ---');
  let updateRes = await pool.query(
    'UPDATE registrations SET status = $1, notes = COALESCE($2, notes) WHERE id = $3 OR registration_number = $3 RETURNING *',
    ['confirmed', 'Test note 1', row.id]
  );
  console.log('Updated rows by id:', updateRes.rowCount, updateRes.rows[0]?.status);

  // Test updating status by registration_number
  console.log('\n--- Test 2: Update status to checked_in by registration_number ---');
  updateRes = await pool.query(
    'UPDATE registrations SET status = $1, notes = COALESCE($2, notes) WHERE id = $3 OR registration_number = $3 RETURNING *',
    ['checked_in', 'Test note 2', row.registration_number]
  );
  console.log('Updated rows by reg_num:', updateRes.rowCount, updateRes.rows[0]?.status);

  // Test updating status to pending
  console.log('\n--- Test 3: Update status to pending ---');
  updateRes = await pool.query(
    'UPDATE registrations SET status = $1, notes = COALESCE($2, notes) WHERE id = $3 OR registration_number = $3 RETURNING *',
    ['pending', null, row.id]
  );
  console.log('Updated rows:', updateRes.rowCount, updateRes.rows[0]?.status);

  // Test updating status to rejected
  console.log('\n--- Test 4: Update status to rejected ---');
  updateRes = await pool.query(
    'UPDATE registrations SET status = $1, notes = COALESCE($2, notes) WHERE id = $3 OR registration_number = $3 RETURNING *',
    ['rejected', null, row.id]
  );
  console.log('Updated rows:', updateRes.rowCount, updateRes.rows[0]?.status);

  // Reset back to original status
  await pool.query(
    'UPDATE registrations SET status = $1, notes = $2 WHERE id = $3',
    [row.status, row.notes, row.id]
  );
  console.log('\nReset back to original status:', row.status);

  await pool.end();
}

test().catch(console.error);
