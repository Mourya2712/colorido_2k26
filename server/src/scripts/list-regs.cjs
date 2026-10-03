const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function checkRegs() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const regs = await client.query('SELECT id, registration_number, event_id, event_name, participant_name, email, roll_number, phone FROM registrations ORDER BY created_at DESC');
  console.log(`Total registrations in Supabase: ${regs.rows.length}`);
  for (const r of regs.rows) {
    console.log(`- ${r.registration_number}: ${r.participant_name} | email: ${r.email} | roll: ${r.roll_number} | phone: ${r.phone} | event: ${r.event_id} (${r.event_name})`);
  }

  await client.end();
}

checkRegs().catch(console.error);
