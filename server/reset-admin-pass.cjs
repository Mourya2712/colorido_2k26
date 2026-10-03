require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  const newPassword = 'Colorido2k26!';
  const hash = await bcrypt.hash(newPassword, 10);
  console.log('New hash generated for:', newPassword);
  
  const res = await pool.query(
    `UPDATE admins SET password_hash = $1 WHERE email = $2 RETURNING email, is_active`,
    [hash, 'admin@colorido2k26.com']
  );
  
  if (res.rows.length > 0) {
    console.log('✓ Password updated for:', res.rows[0].email, '| active:', res.rows[0].is_active);
  } else {
    console.log('No admin found with that email. Inserting...');
    const ins = await pool.query(
      `INSERT INTO admins (id, email, password_hash, name, role, is_active, created_at)
       VALUES (gen_random_uuid(), $1, $2, 'Admin', 'admin', true, NOW())
       RETURNING email`,
      ['admin@colorido2k26.com', hash]
    );
    console.log('✓ Admin created:', ins.rows[0].email);
  }

  // Verify
  const verify = await pool.query('SELECT email, is_active FROM admins WHERE email = $1', ['admin@colorido2k26.com']);
  const row = verify.rows[0];
  const ok = await bcrypt.compare(newPassword, (await pool.query('SELECT password_hash FROM admins WHERE email = $1', ['admin@colorido2k26.com'])).rows[0].password_hash);
  console.log('✓ Login verification:', ok ? 'PASSWORD MATCHES ✓' : 'MISMATCH ✗');
  await pool.end();
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
