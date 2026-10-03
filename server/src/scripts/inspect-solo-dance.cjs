const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function check() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query("SELECT * FROM events WHERE name = 'Solo Dance'");
  console.log('Solo Dance row:', JSON.stringify(res.rows[0], null, 2));
  await client.end();
}
check().catch(console.error);
