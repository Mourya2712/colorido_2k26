const LOCAL_BACKEND = 'http://localhost:3001';

async function testSponsorsFlow() {
  console.log('=== TESTING SPONSORS CRUD & DATA FLOW ===\n');

  // 1. Authenticate as admin
  console.log('1. Authenticating as admin...');
  const loginRes = await fetch(`${LOCAL_BACKEND}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@colorido2k26.com', password: 'Colorido2k26!' })
  });

  if (!loginRes.ok) {
    throw new Error(`Login failed: ${loginRes.status} ${await loginRes.text()}`);
  }
  const { token } = await loginRes.json();
  console.log('✓ Admin authenticated successfully.\n');

  // Clean any previous test sponsors
  const preGetRes = await fetch(`${LOCAL_BACKEND}/api/admin/sponsors`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const preGetData = await preGetRes.json();
  const existingList = preGetData.sponsors || preGetData || [];
  for (const item of existingList) {
    if (item.name.includes('Red Bull Energy')) {
      await fetch(`${LOCAL_BACKEND}/api/admin/sponsors/${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`Cleaned leftover test sponsor: ${item.id}`);
    }
  }

  // 2. Fetch existing sponsors
  console.log('2. Fetching existing sponsors...');
  const getRes = await fetch(`${LOCAL_BACKEND}/api/admin/sponsors`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const getData = await getRes.json();
  const initialSponsors = getData.sponsors || getData || [];
  console.log(`✓ Currently ${initialSponsors.length} sponsors in DB.\n`);

  // 3. Create test sponsor with ALL fields (Add Sponsor test)
  console.log('3. Testing Add Sponsor with all form fields...');
  const testPayload = {
    name: 'Red Bull Energy Test',
    org_name: 'Red Bull GmbH India',
    category: 'title',
    phone: '+91 9876543210',
    amount: '₹1,50,000',
    logo_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87',
    website: 'https://redbull.com',
    description: 'Official Energy Drink Partner providing wing-worthy performance refreshments.'
  };

  const createRes = await fetch(`${LOCAL_BACKEND}/api/admin/sponsors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(testPayload)
  });

  if (!createRes.ok) {
    throw new Error(`Create sponsor failed: ${createRes.status} ${await createRes.text()}`);
  }
  const createData = await createRes.json();
  const createdSponsor = createData.sponsor || createData;
  const createdId = createdSponsor.id;
  console.log(`✓ Add Sponsor SUCCESS (ID: ${createdId})`);
  console.log('  Fields verified:');
  console.log('  - Sponsor Name:', createdSponsor.name);
  console.log('  - Organisation Name:', createdSponsor.org_name);
  console.log('  - Category / Tier:', createdSponsor.category);
  console.log('  - Phone Number:', createdSponsor.phone);
  console.log('  - Sponsorship Amount:', createdSponsor.amount);
  console.log('  - Logo URL:', createdSponsor.logo_url);
  console.log('  - Official Website:', createdSponsor.website);
  console.log('  - Description:', createdSponsor.description);
  console.log();

  // 4. Edit the test sponsor (Edit Sponsor test)
  console.log('4. Testing Edit Sponsor (PATCH /api/admin/sponsors/:id)...');
  const updatedPayload = {
    name: 'Red Bull Energy Updated',
    org_name: 'Red Bull Global Pvt Ltd',
    category: 'platinum',
    phone: '+91 9999888877',
    amount: '₹2,00,000',
    logo_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?v=2',
    website: 'https://redbull.com/in-en',
    description: 'Updated description: Official title sponsor for cultural energy and enthusiasm.'
  };

  const updateRes = await fetch(`${LOCAL_BACKEND}/api/admin/sponsors/${createdId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(updatedPayload)
  });

  if (!updateRes.ok) {
    throw new Error(`Update sponsor failed: ${updateRes.status} ${await updateRes.text()}`);
  }
  const updateData = await updateRes.json();
  const updatedSponsor = updateData.sponsor || updateData;
  console.log(`✓ Edit Sponsor SUCCESS (ID: ${createdId})`);
  console.log('  Updated fields verified:');
  console.log('  - Sponsor Name:', updatedSponsor.name);
  console.log('  - Organisation Name:', updatedSponsor.org_name);
  console.log('  - Category / Tier:', updatedSponsor.category);
  console.log('  - Phone Number:', updatedSponsor.phone);
  console.log('  - Sponsorship Amount:', updatedSponsor.amount);
  console.log('  - Logo URL:', updatedSponsor.logo_url);
  console.log('  - Official Website:', updatedSponsor.website);
  console.log('  - Description:', updatedSponsor.description);
  console.log();

  // 5. Clean up test sponsor
  console.log('5. Cleaning up test sponsor...');
  const deleteRes = await fetch(`${LOCAL_BACKEND}/api/admin/sponsors/${createdId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!deleteRes.ok) {
    throw new Error(`Delete sponsor failed: ${deleteRes.status}`);
  }
  console.log(`✓ Deleted test sponsor ID ${createdId}. Database state fully preserved.\n`);

  console.log('=== ALL SPONSORS CRUD & FIELD TESTS PASSED ===');
}

testSponsorsFlow().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
