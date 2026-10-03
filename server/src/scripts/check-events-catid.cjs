const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: 'server/.env' });

async function checkEventsCategoryId() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  const events = await client.query('SELECT id, slug, category_id, category_name FROM events LIMIT 5');
  console.log('Existing events with category_id:', events.rows);

  await client.end();
}

checkEventsCategoryId().catch(console.error);
