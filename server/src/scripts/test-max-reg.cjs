const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function testMaxReg() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const res = await client.query(`
    SELECT MAX(NULLIF(regexp_replace(registration_number, '^CD26', ''), '')::bigint) as max_num
    FROM registrations
    WHERE registration_number ~ '^CD26[0-9]+$'
  `);
  console.log('Postgres MAX reg number:', res.rows[0]);

  // Also create a sequence if not exists so it's guaranteed atomic
  await client.query(`
    CREATE SEQUENCE IF NOT EXISTS registration_number_seq START WITH 100;
  `);
  // Update sequence to max + 1
  const maxVal = Number(res.rows[0]?.max_num || 0);
  const startVal = Math.max(maxVal + 1, 14);
  await client.query(`SELECT setval('registration_number_seq', $1, false)`, [startVal]);
  const nextVal = await client.query(`SELECT nextval('registration_number_seq') as next_val`);
  console.log('Sequence next val:', nextVal.rows[0]);

  await client.end();
}

testMaxReg().catch(console.error);
