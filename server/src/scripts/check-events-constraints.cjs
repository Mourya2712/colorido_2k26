const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: 'server/.env' });

async function checkEventsConstraints() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  const constraints = await client.query(`
    SELECT conname, contype, pg_get_constraintdef(c.oid)
    FROM pg_constraint c
    JOIN pg_namespace n ON n.oid = c.connamespace
    WHERE conrelid = 'events'::regclass
  `);
  console.log('Constraints on events table:', constraints.rows);

  await client.end();
}

checkEventsConstraints().catch(console.error);
