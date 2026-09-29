const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const dummyRegs = [
  {
    id: 'dreg-001', regNo: 'CD26000001',
    eventId: 'classical-solo-dance', eventName: 'Classical / Folk Solo', eventType: 'cultural', regType: 'individual',
    name: 'Ananya Krishnamurthy', email: 'ananya.k@svec.edu.in', phone: '9876543210',
    college: 'SV Engineering College', roll: 'SVEC22CS043', dept: 'Computer Science (CSE)',
    year: '2nd Year', gender: 'Female', teamName: null, members: '[]', status: 'confirmed',
  },
  {
    id: 'dreg-002', regNo: 'CD26000002',
    eventId: 'western-group-dance', eventName: 'Western Group Dance', eventType: 'cultural', regType: 'team',
    name: 'Rahul Sharma', email: 'rahul.s@vrsec.edu.in', phone: '9876543211',
    college: 'VR Siddhartha Engineering College', roll: 'VR21IT089', dept: 'Information Technology (IT)',
    year: '3rd Year', gender: 'Male', teamName: 'BeatBusters',
    members: JSON.stringify([
      { name: 'Kiran Patel', roll: 'VR21IT090', dept: 'IT', year: '3rd Year', phone: '9876543220', college: 'VR Siddhartha Engineering College' },
      { name: 'Sneha Reddy', roll: 'VR21IT091', dept: 'IT', year: '3rd Year', phone: '9876543221', college: 'VR Siddhartha Engineering College' },
      { name: 'Arjun Das', roll: 'VR21IT092', dept: 'IT', year: '3rd Year', phone: '9876543222', college: 'VR Siddhartha Engineering College' },
    ]),
    status: 'confirmed',
  },
  {
    id: 'dreg-003', regNo: 'CD26000003',
    eventId: 'vocal-solo-light', eventName: 'Light Music / Filmy Solo', eventType: 'cultural', regType: 'individual',
    name: 'Priya Namboodiri', email: 'priya.n@jntuk.edu.in', phone: '9876543212',
    college: 'JNTU Kakinada', roll: '22021A0412', dept: 'Electronics & Communication (ECE)',
    year: '2nd Year', gender: 'Female', teamName: null, members: '[]', status: 'confirmed',
  },
  {
    id: 'dreg-004', regNo: 'CD26000004',
    eventId: 'skit-mime', eventName: 'Theatrical Drama / Skit', eventType: 'cultural', regType: 'team',
    name: 'Venkata Sai Kumar', email: 'sai.kumar@rvrjc.ac.in', phone: '9876543213',
    college: 'RVR & JC College of Engineering', roll: 'Y21CS145', dept: 'Computer Science (CSE)',
    year: '3rd Year', gender: 'Male', teamName: 'The Natak Mandali',
    members: JSON.stringify([
      { name: 'B. Teja', roll: 'Y21CS146', dept: 'CSE', year: '3rd Year', phone: '9876543223', college: 'RVR & JC College of Engineering' },
      { name: 'K. Sumanth', roll: 'Y21CS147', dept: 'CSE', year: '3rd Year', phone: '9876543224', college: 'RVR & JC College of Engineering' },
    ]),
    status: 'pending',
  },
  {
    id: 'dreg-005', regNo: 'CD26000005',
    eventId: 'spot-painting', eventName: 'Live Canvas Painting', eventType: 'cultural', regType: 'individual',
    name: 'Meera Mohandas', email: 'meera.m@klu.ac.in', phone: '9876543214',
    college: 'K L University', roll: '2100030124', dept: 'Civil Engineering',
    year: '4th Year', gender: 'Female', teamName: null, members: '[]', status: 'confirmed',
  },
  {
    id: 'dreg-006', regNo: 'CD26000006',
    eventId: 'general-quiz', eventName: 'Inter-College Mega Quiz', eventType: 'cultural', regType: 'team',
    name: 'Aditya Varma', email: 'aditya.v@bapatla.edu.in', phone: '9876543215',
    college: 'Bapatla Engineering College', roll: 'BEC22ME034', dept: 'Mechanical Engineering',
    year: '2nd Year', gender: 'Male', teamName: 'QuizWits',
    members: JSON.stringify([
      { name: 'S. Harsha', roll: 'BEC22ME035', dept: 'ME', year: '2nd Year', phone: '9876543225', college: 'Bapatla Engineering College' },
    ]),
    status: 'confirmed',
  },
  {
    id: 'dreg-007', regNo: 'CD26000007',
    eventId: 'volleyball-boys', eventName: 'Volleyball Tournament (Boys)', eventType: 'sports_boys', regType: 'team',
    name: 'Rohan Nanda', email: 'rohan.n@vignan.ac.in', phone: '9876543216',
    college: 'Vignan University', roll: 'VU21CS099', dept: 'Computer Science (CSE)',
    year: '3rd Year', gender: 'Male', teamName: 'Vignan Spikers',
    members: JSON.stringify([
      { name: 'K. Manoj', roll: 'VU21CS100', dept: 'CSE', year: '3rd Year', phone: '9876543226', college: 'Vignan University' },
      { name: 'T. Karthik', roll: 'VU21CS101', dept: 'CSE', year: '3rd Year', phone: '9876543227', college: 'Vignan University' },
    ]),
    status: 'confirmed',
  },
  {
    id: 'dreg-008', regNo: 'CD26000008',
    eventId: 'throwball-girls', eventName: 'Throwball Championship (Girls)', eventType: 'sports_girls', regType: 'team',
    name: 'Deepika Rao', email: 'deepika.r@gvpce.ac.in', phone: '9876543217',
    college: 'GVP College of Engineering', roll: 'GVP22EC055', dept: 'Electronics & Communication (ECE)',
    year: '2nd Year', gender: 'Female', teamName: 'GVP Blasters',
    members: JSON.stringify([
      { name: 'A. Lavanya', roll: 'GVP22EC056', dept: 'ECE', year: '2nd Year', phone: '9876543228', college: 'GVP College of Engineering' },
      { name: 'N. Swathi', roll: 'GVP22EC057', dept: 'ECE', year: '2nd Year', phone: '9876543229', college: 'GVP College of Engineering' },
    ]),
    status: 'confirmed',
  },
  {
    id: 'dreg-009', regNo: 'CD26000009',
    eventId: 'basketball-boys', eventName: 'Basketball Championship (Boys)', eventType: 'sports_boys', regType: 'team',
    name: 'Siddharth Roy', email: 'siddharth.r@anits.edu.in', phone: '9876543218',
    college: 'ANITS Visakhapatnam', roll: 'AN21EEE023', dept: 'Electrical & Electronics (EEE)',
    year: '3rd Year', gender: 'Male', teamName: 'ANITS Hoopers',
    members: JSON.stringify([
      { name: 'V. Naresh', roll: 'AN21EEE024', dept: 'EEE', year: '3rd Year', phone: '9876543230', college: 'ANITS Visakhapatnam' },
    ]),
    status: 'confirmed',
  },
  {
    id: 'dreg-010', regNo: 'CD26000010',
    eventId: 'table-tennis-girls', eventName: 'Table Tennis Championship (Girls)', eventType: 'sports_girls', regType: 'individual',
    name: 'Shalini Verma', email: 'shalini.v@andhrauniversity.edu.in', phone: '9876543219',
    college: 'Andhra University', roll: 'AU23CSE011', dept: 'Computer Science (CSE)',
    year: '1st Year', gender: 'Female', teamName: null, members: '[]', status: 'cancelled',
  },
];

async function seedRegsPg() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  for (const r of dummyRegs) {
    await client.query(`
      INSERT INTO registrations
        (id, registration_number, event_id, event_name, event_type, registration_type,
         participant_name, email, phone, college_name, roll_number, department,
         year_of_study, gender, team_name, team_members, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW() - INTERVAL '1 day')
      ON CONFLICT (registration_number) DO NOTHING;
    `, [
      r.id, r.regNo, r.eventId, r.eventName, r.eventType, r.regType,
      r.name, r.email, r.phone, r.college, r.roll, r.dept,
      r.year, r.gender, r.teamName, r.members, r.status
    ]);
  }

  const countRes = await client.query('SELECT COUNT(*) as count FROM registrations');
  console.log('✅ Seeding complete. Total registrations in Supabase:', countRes.rows[0].count);
  await client.end();
}

seedRegsPg().catch(console.error);
