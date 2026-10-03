const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: 'server/.env' });

async function testTimeParsing() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  const r1 = await client.query("SELECT '10:30 AM'::time as t1, '02:45 PM'::time as t2");
  console.log('Postgres parsed 12h times:', r1.rows[0]);

  await client.end();
}

testTimeParsing().catch(console.error);
