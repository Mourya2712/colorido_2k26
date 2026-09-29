import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:3001/api';

async function testSuite() {
  console.log('🚀 Starting COLORIDO 2K26 End-to-End Verification Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Admin Login
  console.log('--- TEST 1: Admin Authentication ---');
  let adminToken = '';
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@colorido.edu', password: 'Colorido2026!' })
    });
    const data = await res.json();
    adminToken = data.token;
    assert(res.ok && !!adminToken, 'Admin login succeeds with JWT token');
  } catch (err) {
    assert(false, `Admin login error: ${err.message}`);
  }

  // 2. Events API & Categories
  console.log('\n--- TEST 2: Events & Categories Endpoints ---');
  let sampleEvent = null;
  try {
    const res = await fetch(`${API_BASE}/events`);
    const data = await res.json();
    assert(res.ok && Array.isArray(data.events) && data.events.length >= 10, `Events endpoint returns ${data.events?.length} active events`);
    
    // Check all 8 cultural categories represented
    const categories = [...new Set(data.events.map(e => e.category_id || e.category))];
    console.log('    Discovered Categories:', categories);
    assert(categories.length >= 8, `At least 8 distinct categories are seeded and served`);

    sampleEvent = data.events.find(e => e.type === 'cultural') || data.events[0];
    assert(!!sampleEvent && 'reg_count' in sampleEvent, 'Events include dynamic reg_count attribute');
  } catch (err) {
    assert(false, `Events API error: ${err.message}`);
  }

  // 3. Popular Events API
  console.log('\n--- TEST 3: Popular Cultural Events (Top 3) ---');
  try {
    const res = await fetch(`${API_BASE}/events/popular`);
    const data = await res.json();
    assert(res.ok && Array.isArray(data.events) && data.events.length <= 3, `Popular events returns top 3 list (${data.events?.length} returned)`);
    assert(data.events.every(e => e.type === 'cultural'), 'Popular events only includes Cultural events');
  } catch (err) {
    assert(false, `Popular events error: ${err.message}`);
  }

  // 4. Audio Upload API
  console.log('\n--- TEST 4: Audio File Upload (Multer) ---');
  let uploadedAudioUrl = '';
  let uploadedAudioName = '';
  try {
    // Create a mock MP3 file
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const fakeMp3Content = Buffer.from('ID3fake-mp3-audio-bytes-for-colorido-2k26');
    const filename = 'test_performance_track.mp3';

    let body = `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="audio"; filename="${filename}"\r\n`;
    body += `Content-Type: audio/mpeg\r\n\r\n`;
    
    const bodyBuffer = Buffer.concat([
      Buffer.from(body, 'utf-8'),
      fakeMp3Content,
      Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8')
    ]);

    const res = await fetch(`${API_BASE}/upload/audio`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: bodyBuffer,
    });
    const data = await res.json();
    uploadedAudioUrl = data.fileUrl;
    uploadedAudioName = data.fileName;
    assert(res.ok && !!uploadedAudioUrl, `Audio upload returns URL: ${uploadedAudioUrl}`);
  } catch (err) {
    assert(false, `Audio upload error: ${err.message}`);
  }

  // 5. In-Website Registration with Audio Track
  console.log('\n--- TEST 5: Direct In-Website Registration Flow ---');
  let regNumber = '';
  let regId = '';
  try {
    const regPayload = {
      event_id: sampleEvent.id,
      event_name: sampleEvent.name,
      event_type: sampleEvent.type,
      registration_type: 'individual',
      participant_name: 'Antigravity Test Participant',
      email: `test_student_${Date.now()}@rvrjc.ac.in`,
      phone: '9876543210',
      college_name: 'RVR & JC College of Engineering',
      roll_number: `Y22CS${Math.floor(1000 + Math.random() * 8999)}`,
      department: 'Computer Science (CSE)',
      year_of_study: '3rd Year',
      gender: 'Male',
      audio_file_url: uploadedAudioUrl,
      audio_file_name: uploadedAudioName,
      created_at: new Date().toISOString()
    };

    const res = await fetch(`${API_BASE}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload)
    });
    const data = await res.json();
    regNumber = data.registration?.registration_number;
    regId = data.registration?.id;
    assert(res.ok && !!regNumber, `Registration confirmed with pass number: ${regNumber}`);

    // Verify registration details by pass number
    const passRes = await fetch(`${API_BASE}/registrations/${regNumber}`);
    const passData = await passRes.json();
    console.log('    Pass audio_file_url:', passData.registration?.audio_file_url, 'Expected:', uploadedAudioUrl);
    assert(passRes.ok && passData.registration?.audio_file_url === uploadedAudioUrl, 'Registration pass preserves audio file URL');
  } catch (err) {
    assert(false, `Registration flow error: ${err.message}`);
  }

  // 6. Admin Registration Detail with Audio
  console.log('\n--- TEST 6: Admin Registration Inspection ---');
  try {
    const res = await fetch(`${API_BASE}/admin/registrations/${regId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    assert(res.ok && data.registration?.audio_file_url === uploadedAudioUrl, 'Admin detail view displays submitted audio track');
  } catch (err) {
    assert(false, `Admin registration inspection error: ${err.message}`);
  }

  // 7. Event Editing (Admin -> Database -> Public Sync)
  console.log('\n--- TEST 7: Admin Event Editing & Live Public Reflection ---');
  try {
    const newDescription = `Live updated description by Admin at ${new Date().toISOString()}`;
    const newDeadline = '2026-10-25T18:00:00.000Z';

    const patchRes = await fetch(`${API_BASE}/admin/events/${sampleEvent.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        description: newDescription,
        registration_deadline: newDeadline,
        min_team_size: 2,
        max_team_size: 8,
        requires_audio: 1
      })
    });
    const patchData = await patchRes.json();
    assert(patchRes.ok, `Admin PATCH /api/admin/events/${sampleEvent.id} succeeded`);

    // Verify change immediately reflected on public API
    const pubRes = await fetch(`${API_BASE}/events/${sampleEvent.id}`);
    const pubData = await pubRes.json();
    const event = pubData.event;
    assert(event.description === newDescription, 'Updated description reflected on public website');
    assert(event.registration_deadline === newDeadline, 'Updated deadline reflected on public website');
    assert(event.min_team_size === 2 && event.max_team_size === 8, 'Updated team sizes reflected on public website');
    assert(event.requires_audio === 1, 'Updated requires_audio flag reflected on public website');
    assert(!!event.registration_deadline_updated_at, 'registration_deadline_updated_at timestamp logged');
  } catch (err) {
    assert(false, `Event editing sync error: ${err.message}`);
  }

  // 8. Deadline Expiration Enforcement
  console.log('\n--- TEST 8: Registration Deadline Expiration Enforcement ---');
  try {
    // Set deadline to past
    await fetch(`${API_BASE}/admin/events/${sampleEvent.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        registration_deadline: '2020-01-01T00:00:00.000Z'
      })
    });

    // Attempt registration
    const closedRes = await fetch(`${API_BASE}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: sampleEvent.id,
        event_name: sampleEvent.name,
        event_type: sampleEvent.type,
        registration_type: 'individual',
        participant_name: 'Late Participant',
        email: `late_${Date.now()}@rvrjc.ac.in`,
        phone: '9876543210',
        college_name: 'RVR & JC College of Engineering',
        roll_number: 'Y22CS000',
        department: 'Computer Science (CSE)',
        year_of_study: '3rd Year',
        gender: 'Male',
        created_at: new Date().toISOString()
      })
    });

    assert(!closedRes.ok && closedRes.status === 400, 'Registration rejected with HTTP 400 when deadline is expired');

    // Restore valid future deadline
    await fetch(`${API_BASE}/admin/events/${sampleEvent.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        registration_deadline: '2026-10-15T23:59:59.000Z'
      })
    });
    console.log('    Restored deadline to future for event.');
  } catch (err) {
    assert(false, `Deadline enforcement error: ${err.message}`);
  }

  // 9. Results Creation and Display
  console.log('\n--- TEST 9: Admin Results Creation & Public Results ---');
  try {
    const resultPayload = {
      event_name: sampleEvent.name,
      category: sampleEvent.category_name || sampleEvent.category || 'Cultural',
      position: '1st Place',
      winner_name: 'Team Velocity Spark',
      winner_college: 'RVR & JC College of Engineering',
      description: 'Outstanding performance with perfect synchronization and stage utilization'
    };

    const res = await fetch(`${API_BASE}/admin/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify(resultPayload)
    });
    assert(res.ok, 'Admin successfully created podium winner result');

    // Verify on public results endpoint
    const pubRes = await fetch(`${API_BASE}/results`);
    const pubData = await pubRes.json();
    const createdResult = pubData.results?.find(r => r.winner_name === 'Team Velocity Spark');
    assert(!!createdResult, 'Winner result appears on public Results endpoint with College and Position');
  } catch (err) {
    assert(false, `Results flow error: ${err.message}`);
  }

  console.log(`\n========================================`);
  console.log(`FINAL RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

testSuite();
