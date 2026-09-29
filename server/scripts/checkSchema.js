const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function checkSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  
  // List all tables
  const tables = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  console.log('Tables:', tables.rows.map(r => r.table_name));
  
  // Check events table columns
  const evCols = await client.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'events' ORDER BY ordinal_position"
  );
  console.log('Events cols:', evCols.rows.map(r => r.column_name + ':' + r.data_type));

  // Check registrations table columns
  const regCols = await client.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'registrations' ORDER BY ordinal_position"
  );
  console.log('Registrations cols:', regCols.rows.map(r => r.column_name + ':' + r.data_type));

  // Count rows
  const regCount = await client.query('SELECT COUNT(*) FROM registrations');
  console.log('Registration count:', regCount.rows[0].count);

  // Check admins
  const admins = await client.query('SELECT id, email, name, role FROM admins');
  console.log('Admins:', admins.rows);
  
  await client.end();
}
checkSchema().catch(console.error);
