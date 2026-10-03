const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function check() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query("SELECT name, to_char(end_date, 'YYYY-MM-DD') as ymd, to_char(end_date, 'DD-MM-YYYY') as dmy FROM events LIMIT 5");
  console.log('PostgreSQL raw formatted dates:');
  console.log(res.rows);
  await client.end();
}
check().catch(console.error);
