const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: 'server/.env' });

async function checkCategoriesTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  console.log('Connected to Supabase PostgreSQL!');

  const catCols = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'event_categories'
  `);
  console.log('Categories columns:', catCols.rows);

  const categories = await client.query('SELECT id, name, type FROM event_categories');
  console.log('Categories rows:', categories.rows);

  await client.end();
}

checkCategoriesTable().catch(console.error);
