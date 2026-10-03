const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: 'server/.env' });

async function testRegGen() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  const res = await client.query("SELECT registration_number FROM registrations WHERE registration_number LIKE 'CD26%'");
  let maxNum = 0;
  for (const r of res.rows) {
    const match = (r.registration_number || '').match(/CD26(\d+)/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > maxNum) maxNum = n;
    }
  }
  const nextNum = maxNum > 0 ? maxNum + 1 : 1;
  const candidate = `CD26${String(nextNum).padStart(6, '0')}`;
  console.log(`Highest existing in Supabase: CD26${String(maxNum).padStart(6, '0')}`);
  console.log(`Generated candidate: ${candidate}`);

  const check = await client.query('SELECT 1 FROM registrations WHERE registration_number = $1', [candidate]);
  console.log(`Is candidate unique?: ${check.rows.length === 0}`);

  await client.end();
}

testRegGen().catch(console.error);
