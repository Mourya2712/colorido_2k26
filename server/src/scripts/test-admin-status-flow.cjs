const { Pool } = require('pg');
require('dotenv').config({ path: 'server/.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const BASE_URL = 'http://localhost:3001';

async function runTests() {
  console.log('=================================================================');
  console.log('COLORIDO 2K26 — Admin Registration Status End-to-End Verification');
  console.log('=================================================================\n');

  // 1. Check Backend Health
  console.log('1. Checking Backend Health (http://localhost:3001/health)...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  console.log('   Health response:', healthData);
  if (healthData.status !== 'ok') throw new Error('Backend health check failed');

  // 2. Admin Login
  console.log('\n2. Logging in as Admin (admin@colorido2k26.com)...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@colorido2k26.com', password: 'Colorido2k26!' })
  });
  const loginData = await loginRes.json();
  if (!loginData.token) throw new Error('Admin login failed: ' + JSON.stringify(loginData));
  const token = loginData.token;
  console.log('   Admin login successful. JWT token received.');

  // 3. Pick a Registration Record
  console.log('\n3. Fetching Registrations List via Admin API...');
  const regListRes = await fetch(`${BASE_URL}/api/admin/registrations`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const regListData = await regListRes.json();
  const testReg = regListData.registrations?.[0];
  if (!testReg) throw new Error('No registrations found in database');
  console.log(`   Target Registration: ID=${testReg.id}, Number=${testReg.registration_number}, Participant=${testReg.participant_name}, Current Status=${testReg.status}`);

  const originalStatus = testReg.status;
  const originalNotes = testReg.notes;

  const buttons = [
    {
      buttonNumber: 1,
      buttonName: 'Approve / Confirm Pass',
      targetStatus: 'confirmed',
      notes: 'Pass verified & approved by admin'
    },
    {
      buttonNumber: 2,
      buttonName: 'Mark Checked In',
      targetStatus: 'checked_in',
      notes: 'Participant checked in at the event registration desk'
    },
    {
      buttonNumber: 3,
      buttonName: 'Set Pending',
      targetStatus: 'pending',
      notes: 'Pending additional student ID verification'
    },
    {
      buttonNumber: 4,
      buttonName: 'Reject Application',
      targetStatus: 'rejected',
      notes: 'Application does not meet eligibility criteria'
    }
  ];

  for (const b of buttons) {
    console.log(`\n-----------------------------------------------------------------`);
    console.log(`Button ${b.buttonNumber}: "${b.buttonName}" -> status: "${b.targetStatus}"`);
    console.log(`-----------------------------------------------------------------`);

    // Step A: Frontend PATCH API Request
    console.log(`   [Frontend -> Backend] PATCH /api/admin/registrations/${testReg.id}/status`);
    console.log(`   Request Body: { status: "${b.targetStatus}", notes: "${b.notes}" }`);
    const patchRes = await fetch(`${BASE_URL}/api/admin/registrations/${testReg.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: b.targetStatus, notes: b.notes })
    });
    console.log(`   Response Status: HTTP ${patchRes.status} ${patchRes.statusText}`);
    const patchBody = await patchRes.json();
    console.log(`   Response Body: success=${patchBody.success}, status=${patchBody.registration?.status}`);

    if (patchRes.status !== 200 || !patchBody.success) {
      throw new Error(`Button ${b.buttonNumber} (${b.buttonName}) failed!`);
    }

    // Step B: Query Database directly to verify actual database state
    console.log(`   [Database Check] Directly querying PostgreSQL database table "registrations"...`);
    const dbCheck = await pool.query(
      'SELECT id, registration_number, status, notes FROM registrations WHERE id = $1',
      [testReg.id]
    );
    const dbRow = dbCheck.rows[0];
    console.log(`   Database row: status="${dbRow.status}", notes="${dbRow.notes}"`);
    if (dbRow.status !== b.targetStatus) {
      throw new Error(`Database status mismatch: expected ${b.targetStatus}, got ${dbRow.status}`);
    }
    console.log(`   -> DATABASE CONFIRMED: status successfully updated to "${dbRow.status}"`);

    // Step C: Simulate Page Refresh (GET /api/admin/registrations/:id)
    console.log(`   [Page Refresh Simulation] GET /api/admin/registrations/${testReg.id}...`);
    const getRes = await fetch(`${BASE_URL}/api/admin/registrations/${testReg.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const getBody = await getRes.json();
    console.log(`   Refreshed record status: "${getBody.registration?.status}"`);
    if (getBody.registration?.status !== b.targetStatus) {
      throw new Error(`Page refresh did not preserve updated status!`);
    }
    console.log(`   -> PAGE REFRESH PRESERVED: status "${getBody.registration?.status}" confirmed!`);
  }

  // Restore original status
  console.log(`\n-----------------------------------------------------------------`);
  console.log(`Restoring test record to original status: "${originalStatus}"...`);
  await pool.query(
    'UPDATE registrations SET status = $1, notes = $2 WHERE id = $3',
    [originalStatus, originalNotes, testReg.id]
  );
  console.log('   Restored successfully.');

  await pool.end();
  console.log('\n=================================================================');
  console.log('ALL 4 STATUS BUTTON TESTS COMPLETED AND VERIFIED 100% SUCCESSFULLY');
  console.log('=================================================================\n');
}

runTests().catch((err) => {
  console.error('\nTEST SUITE FAILED:', err);
  process.exit(1);
});
