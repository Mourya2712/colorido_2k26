import Database from 'better-sqlite3';

const db = new Database(':memory:');
db.exec(`
  CREATE TABLE registrations (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    registration_number TEXT UNIQUE NOT NULL,
    event_id TEXT NOT NULL,
    event_name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    registration_type TEXT NOT NULL DEFAULT 'individual',
    participant_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    college_name TEXT,
    roll_number TEXT,
    department TEXT,
    year_of_study TEXT,
    gender TEXT,
    team_name TEXT,
    team_members TEXT DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'confirmed',
    notes TEXT,
    created_at TEXT NOT NULL
  );
`);

const sql = `
  INSERT INTO registrations
    (registration_number, event_id, event_name, event_type, registration_type,
     participant_name, email, phone, college_name, roll_number, department,
     year_of_study, gender, team_name, team_members, status, created_at)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'confirmed', $16)
   RETURNING *
`;

// Convert $1, $2, ... to ?
const sqliteSql = sql.replace(/\$\d+/g, '?');
const stmt = db.prepare(sqliteSql);
const row = stmt.get(
  'CD26000001', 'dance-1', 'Classical Dance', 'cultural', 'individual',
  'Mourya', 'mourya@example.com', '9876543210', 'RVR & JC', 'Y22CS001',
  'CSE', '3rd Year', 'Male', null, '[]', new Date().toISOString()
);

console.log('INSERT RESULT:', row);

const selectSql = "SELECT * FROM registrations WHERE event_id = ? AND LOWER(email) = LOWER(?)".replace(/\$\d+/g, '?');
const sel = db.prepare(selectSql).all('dance-1', 'mourya@example.com');
console.log('SELECT RESULT:', sel);
