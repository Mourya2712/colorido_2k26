const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../data/colorido2k26.db');
const db = new Database(dbPath);

console.log('Resetting and seeding exact 8 demo registrations...');

db.prepare("DELETE FROM registrations").run();

const insert = db.prepare(`
  INSERT INTO registrations (
    id, registration_number, event_id, event_name, event_type, registration_type,
    participant_name, email, phone, college_name, roll_number, department,
    year_of_study, gender, team_name, team_members, audio_file_url, audio_file_name,
    status, notes, created_at
  ) VALUES (
    ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?,
    ?, ?, ?
  )
`);

const registrations = [
  // 1. Cultural (Individual) - Confirmed
  [
    'reg-seed-001', 'CD26000001', 'classical-solo-dance', 'Classical / Folk Solo', 'cultural', 'individual',
    'V. Chaitanya Teja', 'chaitanya.v@gmail.com', '9848123456', 'VR Siddhartha Engg College', 'Y22CS120', 'Computer Science (CSE)',
    '3rd Year', 'Male', null, '[]', null, null,
    'confirmed', 'E-Pass confirmed and verified', new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  ],
  // 2. Cultural (Team) - Confirmed
  [
    'reg-seed-002', 'CD26000002', 'western-group-dance', 'Western Group Dance', 'cultural', 'team',
    'K. Karthik', 'karthik.k@gmail.com', '9848123459', 'VR Siddhartha Engg College', 'Y22CS125', 'Computer Science (CSE)',
    '3rd Year', 'Male', 'Rhythm Crafters', JSON.stringify([
      { full_name: 'R. Akhil', roll_number: 'Y22CS130', phone: '9848123457', college: 'VR Siddhartha Engg College' },
      { full_name: 'M. Bhavana', roll_number: 'Y22CS135', phone: '9848123458', college: 'VR Siddhartha Engg College' }
    ]), null, null,
    'confirmed', 'Track submitted on stage', new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  ],
  // 3. Cultural (Team) - Pending
  [
    'reg-seed-003', 'CD26000003', 'battle-of-bands', 'Battle of the Bands', 'cultural', 'team',
    'S. David Abhishek', 'david.echo@gmail.com', '9440556677', 'Andhra University COE', 'AU2023CS04', 'Information Technology (IT)',
    '3rd Year', 'Male', 'Acoustic Voltage', JSON.stringify([
      { full_name: 'T. Samuel', roll_number: 'AU2023CS08', phone: '9440556678', college: 'Andhra University COE' }
    ]), null, null,
    'pending', 'Awaiting equipment clearance', new Date(Date.now() - 3600000 * 24).toISOString()
  ],
  // 4. Boys Sports (Team) - Confirmed
  [
    'reg-seed-004', 'CD26000004', 'volleyball-boys', 'Volleyball Championship (Boys)', 'sports_boys', 'team',
    'K. Mahesh Naidu', 'mahesh.k@bec.edu', '9390123456', 'Bapatla Engineering College', '22BEC091', 'Civil Engineering',
    '2nd Year', 'Male', 'RVRJC Spikers', JSON.stringify([
      { full_name: 'P. Rohit', roll_number: '22BEC092', phone: '9390123457', college: 'Bapatla Engineering College' },
      { full_name: 'V. Sandeep', roll_number: '22BEC093', phone: '9390123458', college: 'Bapatla Engineering College' }
    ]), null, null,
    'confirmed', 'Medical clearance approved', new Date(Date.now() - 3600000 * 18).toISOString()
  ],
  // 5. Boys Sports (Team) - Confirmed
  [
    'reg-seed-005', 'CD26000005', 'basketball-boys', 'Basketball Championship (Boys)', 'sports_boys', 'team',
    'P. Sai Krishna', 'krishna.sai@vignan.ac.in', '9849112233', 'Vignan University, Vadlamudi', '211FA04012', 'Mechanical Engineering',
    '4th Year', 'Male', 'Vignan Dunkers', JSON.stringify([
      { full_name: 'D. Ajay', roll_number: '211FA04015', phone: '9849112234', college: 'Vignan University' }
    ]), null, null,
    'confirmed', 'Jersey verification complete', new Date(Date.now() - 3600000 * 12).toISOString()
  ],
  // 6. Boys Sports (Individual) - Pending
  [
    'reg-seed-006', 'CD26000006', 'table-tennis-boys', 'Table Tennis Championship (Boys)', 'sports_boys', 'individual',
    'T. Mourya', 'mourya.t@rvrjc.edu', '9876543210', 'R.V.R. & J.C. College of Engineering', 'Y22CS189', 'Artificial Intelligence & Data Science',
    '3rd Year', 'Male', null, '[]', null, null,
    'pending', 'Slot assignment in progress', new Date(Date.now() - 3600000 * 8).toISOString()
  ],
  // 7. Girls Sports (Team) - Confirmed
  [
    'reg-seed-007', 'CD26000007', 'throwball-girls', 'Throwball Championship (Girls)', 'sports_girls', 'team',
    'K. Ananya Reddy', 'ananya.k@rvrjc.ac.in', '9123456780', 'R.V.R. & J.C. College of Engineering', 'Y23IT044', 'Information Technology (IT)',
    '2nd Year', 'Female', 'RVRJC Phoenix', JSON.stringify([
      { full_name: 'B. Haritha', roll_number: 'Y23IT045', phone: '9123456781', college: 'R.V.R. & J.C. College of Engineering' }
    ]), null, null,
    'confirmed', 'Host college varsity squad', new Date(Date.now() - 3600000 * 4).toISOString()
  ],
  // 8. Girls Sports (Individual) - Confirmed
  [
    'reg-seed-008', 'CD26000008', 'tennikoit-girls', 'Tennikoit Tournament (Girls)', 'sports_girls', 'individual',
    'M. Sreeja Rao', 'sreeja.music@klu.ac.in', '9988776655', 'KL University', '220003011', 'Electronics & Comm (ECE)',
    '3rd Year', 'Female', null, '[]', null, null,
    'confirmed', 'Court time assigned', new Date(Date.now() - 3600000 * 2).toISOString()
  ]
];

for (const reg of registrations) {
  insert.run(...reg);
}

// Verify counts
const total = db.prepare("SELECT COUNT(*) as c FROM registrations WHERE status != 'cancelled'").get().c;
const cultural = db.prepare("SELECT COUNT(*) as c FROM registrations WHERE event_type = 'cultural' AND status != 'cancelled'").get().c;
const boys = db.prepare("SELECT COUNT(*) as c FROM registrations WHERE (event_type = 'sports_boys' OR event_type = 'boysSports') AND status != 'cancelled'").get().c;
const girls = db.prepare("SELECT COUNT(*) as c FROM registrations WHERE (event_type = 'sports_girls' OR event_type = 'girlsSports') AND status != 'cancelled'").get().c;
const confirmed = db.prepare("SELECT COUNT(*) as c FROM registrations WHERE status = 'confirmed'").get().c;
const pending = db.prepare("SELECT COUNT(*) as c FROM registrations WHERE status = 'pending'").get().c;

console.log(`Seeded Successfully!
Total: ${total}
Cultural: ${cultural}
Boys Sports: ${boys}
Girls Sports: ${girls}
Confirmed: ${confirmed}
Pending: ${pending}
`);
