const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: 'server/.env' });
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('STARTING COLORIDO 2K26 VERIFICATION TEST SUITE');
  console.log('====================================================');

  const BASE_URL = 'http://localhost:3001';

  // 1. Health check
  console.log('\n--- TEST 1: Backend Health Check ---');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  if (healthRes.status === 200 && healthData.status === 'ok') {
    console.log('✓ Backend health check passed:', healthData);
  } else {
    throw new Error(`Health check failed: ${JSON.stringify(healthData)}`);
  }

  // 2. Admin Login
  console.log('\n--- TEST 2: Admin Login Authentication ---');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@colorido2k26.com',
      password: 'Colorido2k26!'
    })
  });
  const loginData = await loginRes.json();
  if (loginRes.status === 200 && loginData.token) {
    console.log('✓ Admin login succeeded! User:', loginData.admin);
    console.log('✓ JWT Token generated:', loginData.token.slice(0, 30) + '...');
  } else {
    throw new Error(`Admin login failed: ${JSON.stringify(loginData)}`);
  }

  // 3. Admin Dashboard with Token
  console.log('\n--- TEST 3: Admin Dashboard Access ---');
  const dashRes = await fetch(`${BASE_URL}/api/admin/dashboard`, {
    headers: { 'Authorization': `Bearer ${loginData.token}` }
  });
  const dashData = await dashRes.json();
  if (dashRes.status === 200 && dashData.stats) {
    console.log('✓ Admin dashboard accessed! Stats:', dashData.stats);
  } else {
    throw new Error(`Admin dashboard access failed: ${JSON.stringify(dashData)}`);
  }

  // 4. Verify all event end dates in database
  console.log('\n--- TEST 4: Event End Dates in Database ---');
  const pgClient = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await pgClient.connect();
  const dbEvents = await pgClient.query("SELECT id, name, to_char(end_date, 'YYYY-MM-DD') as ymd, to_char(end_date, 'DD-MM-YYYY') as dmy FROM events");
  console.log(`✓ Total events in Supabase: ${dbEvents.rows.length}`);
  const nonMatching = dbEvents.rows.filter(e => e.ymd !== '2026-10-08');
  if (nonMatching.length === 0) {
    console.log('✓ ALL events have end_date = 2026-10-08 (08-10-2026)!');
  } else {
    throw new Error(`Events with non-matching end_date found: ${JSON.stringify(nonMatching)}`);
  }

  // 5. New Individual Registration
  console.log('\n--- TEST 5: New Individual Registration ---');
  const randSuffix = Date.now().toString().slice(-6);
  const indEmail = `participant_${randSuffix}@rvrjc.ac.in`;
  const indRoll = `Y23CS${randSuffix}`;
  const indPayload = {
    event_id: 'dance-solo',
    event_name: 'Solo Dance',
    event_type: 'cultural',
    registration_type: 'individual',
    participant_name: `Mourya Individual ${randSuffix}`,
    email: indEmail,
    phone: `98${randSuffix.padStart(8, '0')}`,
    college_name: 'R.V.R. & J.C. College of Engineering',
    roll_number: indRoll,
    department: 'Computer Science (CSE)',
    year_of_study: '3rd Year',
    gender: 'Male'
  };

  const indRes = await fetch(`${BASE_URL}/api/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(indPayload)
  });
  const indData = await indRes.json();
  if (indRes.status === 201 && indData.registration?.registration_number) {
    console.log('✓ Individual registration succeeded!');
    console.log('✓ E-Pass Number generated:', indData.registration.registration_number);
    console.log('✓ Participant:', indData.registration.participant_name);
  } else {
    throw new Error(`Individual registration failed: ${JSON.stringify(indData)}`);
  }

  // 6. Genuine Duplicate Registration (same email + same event)
  console.log('\n--- TEST 6: Genuine Duplicate Registration Rejection ---');
  const dupRes = await fetch(`${BASE_URL}/api/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(indPayload)
  });
  const dupData = await dupRes.json();
  if (dupRes.status === 409 && (dupData.error || '').toLowerCase().includes('already registered')) {
    console.log('✓ Genuine duplicate registration correctly rejected with 409:', dupData.error);
  } else {
    throw new Error(`Duplicate registration was not rejected properly: ${dupRes.status} ${JSON.stringify(dupData)}`);
  }

  // 7. Same participant registering for a DIFFERENT event
  console.log('\n--- TEST 7: Same Participant for Different Event ---');
  const diffEventPayload = {
    ...indPayload,
    event_id: 'fine-arts-pencil-sketching',
    event_name: 'Pencil Sketching',
    event_type: 'cultural',
  };
  const diffRes = await fetch(`${BASE_URL}/api/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(diffEventPayload)
  });
  const diffData = await diffRes.json();
  if (diffRes.status === 201 && diffData.registration?.registration_number) {
    console.log('✓ Registration for different event succeeded with new E-Pass:', diffData.registration.registration_number);
    if (diffData.registration.registration_number === indData.registration.registration_number) {
      throw new Error('E-Pass numbers must be unique across registrations!');
    }
    console.log('✓ Unique E-Pass confirmed distinct from previous registration.');
  } else {
    throw new Error(`Registration for different event failed: ${JSON.stringify(diffData)}`);
  }

  // 8. New Team Registration
  console.log('\n--- TEST 8: New Team Registration ---');
  const teamRand = (Date.now() + 1).toString().slice(-6);
  const teamPayload = {
    event_id: 'throwball-girls',
    event_name: 'Throwball Tournament (Girls)',
    event_type: 'sports_girls',
    registration_type: 'team',
    participant_name: `Captain Radha ${teamRand}`,
    email: `radha_${teamRand}@rvrjc.ac.in`,
    phone: `91${teamRand.padStart(8, '1')}`,
    college_name: 'R.V.R. & J.C. College of Engineering',
    roll_number: `Y23EC${teamRand}`,
    department: 'Electronics & Comm (ECE)',
    year_of_study: '3rd Year',
    gender: 'Female',
    team_name: `Thunderbolts ${teamRand}`,
    team_members: [
      { full_name: 'Pooja Sharma', roll_number: `Y23EC${teamRand}1`, phone: '9876500001', college: 'RVRJC' },
      { full_name: 'Deepa Lakshmi', roll_number: `Y23EC${teamRand}2`, phone: '9876500002', college: 'RVRJC' },
      { full_name: 'Kavitha Devi', roll_number: `Y23EC${teamRand}3`, phone: '9876500003', college: 'RVRJC' }
    ]
  };

  const teamRes = await fetch(`${BASE_URL}/api/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(teamPayload)
  });
  const teamData = await teamRes.json();
  if (teamRes.status === 201 && teamData.registration?.registration_number) {
    console.log('✓ Team registration succeeded!');
    console.log('✓ Team E-Pass Number:', teamData.registration.registration_number);
    console.log('✓ Team Name:', teamData.registration.team_name);
    console.log('✓ Team Members count:', teamData.registration.team_members?.length);
  } else {
    throw new Error(`Team registration failed: ${JSON.stringify(teamData)}`);
  }

  // 9. Lookup Registration from Database
  console.log('\n--- TEST 9: Lookup Registration from Database ---');
  const lookupRes = await fetch(`${BASE_URL}/api/registrations/${teamData.registration.registration_number}`);
  const lookupData = await lookupRes.json();
  if (lookupRes.status === 200 && lookupData.registration) {
    const reg = lookupData.registration;
    console.log('✓ Registration lookup succeeded:');
    console.log(`  - Participant: ${reg.participant_name}`);
    console.log(`  - Team Name: ${reg.team_name}`);
    console.log(`  - College: ${reg.college_name}`);
    console.log(`  - Event: ${reg.event_name}`);
    console.log(`  - Members in DB: ${reg.team_members.length}`);
    if (reg.participant_name !== teamPayload.participant_name || reg.team_name !== teamPayload.team_name) {
      throw new Error('Database lookup details do not match submitted details!');
    }
  } else {
    throw new Error(`Lookup failed: ${JSON.stringify(lookupData)}`);
  }

  await pgClient.end();
  console.log('\n====================================================');
  console.log('ALL API AND DATABASE TESTS PASSED WITH 100% SUCCESS!');
  console.log('====================================================');
}

runTestSuite().catch(e => {
  console.error('TEST SUITE FAILED:', e);
  process.exit(1);
});
