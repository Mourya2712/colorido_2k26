const bcrypt = require('bcryptjs');
const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function updateAdmin() {
  const hash = await bcrypt.hash('Colorido2k26!', 10);
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  
  // Upsert admin with Colorido2k26! password
  const res = await client.query(
    `INSERT INTO admins (email, password_hash, name, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE 
     SET password_hash = EXCLUDED.password_hash
     RETURNING id, email, name, role;`,
    ['admin@colorido2k26.com', hash, 'COLORIDO Organizer', 'super_admin']
  );

  console.log('Admin updated in Supabase:', res.rows[0]);
  await client.end();
}

updateAdmin().catch(console.error);
