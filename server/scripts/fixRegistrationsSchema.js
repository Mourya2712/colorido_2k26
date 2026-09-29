const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function fixSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  console.log('Altering / recreating registrations table in Supabase to match application model...');
  
  // Drop old incompatible registrations table if empty or recreate
  await client.query(`DROP TABLE IF EXISTS registrations CASCADE;`);

  await client.query(`
    CREATE TABLE IF NOT EXISTS registrations (
      id TEXT PRIMARY KEY,
      registration_number VARCHAR(50) UNIQUE NOT NULL,
      event_id VARCHAR(255) NOT NULL,
      event_name VARCHAR(255) NOT NULL,
      event_type VARCHAR(100) NOT NULL,
      registration_type VARCHAR(50) NOT NULL DEFAULT 'individual',
      participant_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      college_name VARCHAR(255),
      roll_number VARCHAR(100),
      department VARCHAR(100),
      year_of_study VARCHAR(50),
      gender VARCHAR(50),
      team_name VARCHAR(255),
      team_members TEXT DEFAULT '[]',
      audio_file_url TEXT,
      audio_file_name TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
    CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
    CREATE INDEX IF NOT EXISTS idx_registrations_reg_num ON registrations(registration_number);
  `);

  console.log('✅ Registrations table successfully updated in Supabase PostgreSQL!');
  await client.end();
}

fixSchema().catch(console.error);
