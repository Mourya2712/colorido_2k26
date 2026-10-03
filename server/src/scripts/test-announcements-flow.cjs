const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function runTest() {
  const BASE_URL = 'http://localhost:3001/api';

  console.log('--- Step 1: Login Admin to get Token ---');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@colorido2k26.com', password: process.env.ADMIN_DEFAULT_PASSWORD || 'Colorido2k26!' }),
  });
  const loginData = await loginRes.json();
  if (!loginData.token) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginData));
  }
  const token = loginData.token;
  const adminHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  console.log('✅ Admin login successful');

  console.log('\n--- Step 2: Fetch Public Announcements ---');
  const publicRes1 = await fetch(`${BASE_URL}/announcements`);
  const publicData1 = await publicRes1.json();
  console.log(`Public announcements count: ${publicData1.announcements.length}`);

  console.log('\n--- Step 3: Fetch Admin Announcements ---');
  const adminRes1 = await fetch(`${BASE_URL}/admin/announcements`, { headers: adminHeaders });
  const adminData1 = await adminRes1.json();
  console.log(`Admin announcements count: ${adminData1.announcements.length}`);

  console.log('\n--- Step 4: Admin creates new announcement ---');
  const uniqueTitle = 'Test Announcement ' + Date.now();
  const createRes = await fetch(`${BASE_URL}/admin/announcements`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      title: uniqueTitle,
      content: 'This is a test announcement created via admin API for verification.',
      category: 'Cultural',
      is_urgent: true,
      is_ticker: true,
    }),
  });
  const createData = await createRes.json();
  if (!createData.announcement || !createData.announcement.id) {
    throw new Error('Failed to create announcement: ' + JSON.stringify(createData));
  }
  const createdId = createData.announcement.id;
  console.log(`✅ Announcement created with ID: ${createdId}, is_urgent: ${createData.announcement.is_urgent}`);

  console.log('\n--- Step 5: Check public portal reflects new announcement ---');
  const publicRes2 = await fetch(`${BASE_URL}/announcements`);
  const publicData2 = await publicRes2.json();
  const foundPublic = publicData2.announcements.find(a => a.id === createdId || a.title === uniqueTitle);
  if (!foundPublic) {
    throw new Error('Created announcement NOT found on public endpoint!');
  }
  console.log(`✅ Found on public endpoint: "${foundPublic.title}", is_urgent: ${foundPublic.is_urgent}`);

  console.log('\n--- Step 6: Admin edits announcement ---');
  const updatedTitle = uniqueTitle + ' [UPDATED]';
  const patchRes = await fetch(`${BASE_URL}/admin/announcements/${createdId}`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({
      title: updatedTitle,
      content: 'Updated content for verification.',
      is_urgent: false,
    }),
  });
  const patchData = await patchRes.json();
  console.log(`✅ Edited announcement: "${patchData.announcement.title}", is_urgent: ${patchData.announcement.is_urgent}`);

  console.log('\n--- Step 7: Check public portal reflects updated content ---');
  const publicRes3 = await fetch(`${BASE_URL}/announcements`);
  const publicData3 = await publicRes3.json();
  const foundUpdated = publicData3.announcements.find(a => a.id === createdId);
  if (!foundUpdated || foundUpdated.title !== updatedTitle) {
    throw new Error('Updated announcement not reflected on public endpoint!');
  }
  console.log(`✅ Verified updated on public: "${foundUpdated.title}", is_urgent: ${foundUpdated.is_urgent}`);

  console.log('\n--- Step 8: Admin deletes announcement ---');
  const deleteRes = await fetch(`${BASE_URL}/admin/announcements/${createdId}`, {
    method: 'DELETE',
    headers: adminHeaders,
  });
  const deleteData = await deleteRes.json();
  console.log(`✅ Delete response:`, deleteData);

  console.log('\n--- Step 9: Verify deleted announcement is gone from public ---');
  const publicRes4 = await fetch(`${BASE_URL}/announcements`);
  const publicData4 = await publicRes4.json();
  const stillFound = publicData4.announcements.find(a => a.id === createdId);
  if (stillFound) {
    throw new Error('Deleted announcement still appears on public endpoint!');
  }
  console.log('✅ Verified deleted announcement no longer appears on public portal!');

  console.log('\n🎉 ALL ANNOUNCEMENT CONSISTENCY TESTS PASSED PERFECTLY!');
}

runTest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
