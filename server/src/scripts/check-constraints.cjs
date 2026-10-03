const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function checkConstraints() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const constraints = await client.query(`
    SELECT conname, contype, pg_get_constraintdef(c.oid)
    FROM pg_constraint c
    JOIN pg_namespace n ON n.oid = c.connamespace
    WHERE conrelid = 'registrations'::regclass
  `);
  console.log('Constraints on registrations table:');
  console.log(constraints.rows);

  const indexes = await client.query(`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'registrations'
  `);
  console.log('Indexes on registrations table:');
  console.log(indexes.rows);

  await client.end();
}

checkConstraints().catch(console.error);
