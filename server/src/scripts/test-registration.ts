async function runTests() {
  console.log('Testing Registration Flow...');

  // 1. Submit Individual Registration
  const indPayload = {
    participant_name: 'Aditya Kumar',
    email: 'aditya.kumar@gmail.com',
    phone: '9848012345',
    college_name: 'RVR & JC College of Engineering',
    roll_number: 'Y22CS010',
    event_id: 'classical_solo_dance',
    event_name: 'Classical Solo Dance',
    event_type: 'cultural',
    registration_type: 'individual',
    department: 'Computer Science',
    year_of_study: '3rd Year',
    gender: 'Male',
  };

  const indRes = await fetch('http://localhost:3001/api/registrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(indPayload),
  });
  const indData: any = await indRes.json();
  console.log('1. Individual Registration Status:', indRes.status);
  console.log('   Response:', JSON.stringify(indData, null, 2));

  if (!indData.success || !indData.registration?.registration_number) {
    throw new Error('Individual registration failed!');
  }
  const regNumber = indData.registration.registration_number;

  // 2. Duplicate Validation Check
  const dupRes = await fetch('http://localhost:3001/api/registrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(indPayload),
  });
  console.log('2. Duplicate check Status:', dupRes.status);
  const dupData: any = await dupRes.json();
  console.log('   Duplicate check error:', dupData.error);

  // 3. Submit Team Registration
  const teamPayload = {
    participant_name: 'Captain Rahul',
    email: 'rahul.captain@gmail.com',
    phone: '9988776655',
    college_name: 'Andhra University',
    roll_number: 'AU2022045',
    event_id: 'volleyball_boys',
    event_name: 'Volleyball (Boys)',
    event_type: 'sports_boys',
    registration_type: 'team',
    department: 'Mechanical',
    year_of_study: '4th Year',
    gender: 'Male',
    team_name: 'AU Strikers',
    team_members: [
      { name: 'Kiran', roll_number: 'AU2022046', phone: '9988776656' },
      { name: 'Suresh', roll_number: 'AU2022047', phone: '9988776657' },
      { name: 'Manoj', roll_number: 'AU2022048', phone: '9988776658' },
      { name: 'Vikas', roll_number: 'AU2022049', phone: '9988776659' },
      { name: 'Prasad', roll_number: 'AU2022050', phone: '9988776660' },
    ],
  };

  const teamRes = await fetch('http://localhost:3001/api/registrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(teamPayload),
  });
  const teamData: any = await teamRes.json();
  console.log('3. Team Registration Status:', teamRes.status);
  console.log('   Team Reg Num:', teamData.registration?.registration_number);
  console.log('   Team Members saved count:', teamData.registration?.team_members?.length);

  // 4. Public Lookup by Registration Number
  const lookupRes = await fetch(`http://localhost:3001/api/registrations/${regNumber}`);
  const lookupData: any = await lookupRes.json();
  console.log('4. Lookup Status:', lookupRes.status);
  console.log('   Lookup found participant:', lookupData.registration?.participant_name);

  // 5. Admin Login and Verification
  const loginRes = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@colorido.edu', password: 'Colorido2026!' }),
  });
  const loginData: any = await loginRes.json();
  console.log('5. Admin Login Status:', loginRes.status, 'Token received:', !!loginData.token);

  if (loginData.token) {
    const adminDashRes = await fetch('http://localhost:3001/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${loginData.token}` },
    });
    const dashData: any = await adminDashRes.json();
    console.log('6. Admin Dashboard stats:', dashData.stats);

    const adminRegsRes = await fetch('http://localhost:3001/api/admin/registrations', {
      headers: { Authorization: `Bearer ${loginData.token}` },
    });
    const regsData: any = await adminRegsRes.json();
    console.log('7. Admin Registrations count:', regsData.registrations?.length);
    console.log('   Latest reg participant:', regsData.registrations?.[0]?.participant_name);
    console.log('   Latest reg team members:', regsData.registrations?.[0]?.team_members);
  }

  console.log('\nAll Backend Verification Checks Complete!');
}

runTests().catch(console.error);
