const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function test() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const query = (t, p) => client.query(t, p);

  await query(`CREATE SEQUENCE IF NOT EXISTS registration_number_seq START WITH 14`);
  const seqRes = await query(`SELECT nextval('registration_number_seq') as next_val`);
  console.log('Next val from sequence:', seqRes.rows[0].next_val);
  const val = parseInt(seqRes.rows[0].next_val, 10);
  const candidate = `CD26${String(val).padStart(6, '0')}`;
  console.log('Candidate reg number:', candidate);

  const check = await query('SELECT 1 FROM registrations WHERE registration_number = $1', [candidate]);
  console.log('Exists in DB?', check.rows.length > 0);

  await client.end();
}

test().catch(console.error);
