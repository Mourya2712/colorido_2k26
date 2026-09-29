import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import { seedCategories, seedEvents } from './seedData';

dotenv.config();

let usePg = Boolean(process.env.DATABASE_URL);
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost'))
    ? { rejectUnauthorized: false }
    : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
});

if (process.env.DATABASE_URL) {
  pgPool.connect()
    .then((client) => {
      usePg = true;
      client.release();
      console.log('📦 Connected to PostgreSQL database.');
    })
    .catch((err) => {
      console.warn(`⚠️ PostgreSQL connection warning: ${err.message}`);
    });
}

// ── SQLite Local Cache & Fallback ──────────────────────────────────────────
const DATA_DIR = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

let sqlite: any = null;
try {
  const Database = require('better-sqlite3');
  sqlite = new Database(path.join(DATA_DIR, 'colorido2k26.db'));
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');


// Bootstrap schema
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    is_active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS event_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    icon_name TEXT,
    color_scheme TEXT
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    category_id TEXT NOT NULL,
    category_name TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    tagline TEXT,
    short_description TEXT,
    description TEXT,
    rules TEXT DEFAULT '[]',
    venue TEXT,
    schedule_date TEXT,
    start_time TEXT,
    end_time TEXT,
    registration_type TEXT DEFAULT 'individual',
    min_team_size INTEGER DEFAULT 1,
    max_team_size INTEGER DEFAULT 1,
    team_size_label TEXT,
    gender TEXT DEFAULT 'all',
    is_active INTEGER DEFAULT 1,
    is_registration_open INTEGER DEFAULT 1,
    registration_deadline TEXT,
    registration_deadline_updated_at TEXT,
    requires_audio INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS registrations (
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
    audio_file_url TEXT,
    audio_file_name TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed',
    notes TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    is_urgent INTEGER NOT NULL DEFAULT 0,
    is_ticker INTEGER NOT NULL DEFAULT 1,
    link_url TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS schedule_items (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT,
    venue TEXT,
    schedule_date TEXT,
    start_time TEXT,
    end_time TEXT
  );

  CREATE TABLE IF NOT EXISTS results (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    category TEXT,
    event_id TEXT,
    event_name TEXT NOT NULL,
    position TEXT,
    winner_name TEXT,
    winner_college TEXT,
    description TEXT,
    first_place_team TEXT,
    first_place_college TEXT,
    second_place_team TEXT,
    second_place_college TEXT,
    second_place_description TEXT,
    third_place_team TEXT,
    third_place_college TEXT,
    third_place_description TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS gallery (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    title TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    image_url TEXT NOT NULL,
    caption TEXT,
    year TEXT DEFAULT '2026',
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS sponsors (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    tier TEXT DEFAULT 'associate',
    logo_url TEXT,
    website_url TEXT,
    description TEXT
  );
`);

// Safe column migrations on existing database
try { sqlite.exec("ALTER TABLE registrations ADD COLUMN audio_file_url TEXT"); } catch {}
try { sqlite.exec("ALTER TABLE registrations ADD COLUMN audio_file_name TEXT"); } catch {}
try { sqlite.exec("ALTER TABLE results ADD COLUMN position TEXT"); } catch {}
try { sqlite.exec("ALTER TABLE results ADD COLUMN winner_name TEXT"); } catch {}
try { sqlite.exec("ALTER TABLE results ADD COLUMN winner_college TEXT"); } catch {}
try { sqlite.exec("ALTER TABLE results ADD COLUMN description TEXT"); } catch {}
try { sqlite.exec("ALTER TABLE results ADD COLUMN event_id TEXT"); } catch {}
try { sqlite.exec("ALTER TABLE results ADD COLUMN created_at TEXT"); } catch {}
try { sqlite.exec("ALTER TABLE results ADD COLUMN second_place_description TEXT"); } catch {}
try { sqlite.exec("ALTER TABLE results ADD COLUMN third_place_description TEXT"); } catch {}
try { sqlite.exec("ALTER TABLE schedule_items ADD COLUMN event_id TEXT"); } catch {}
try { sqlite.exec("ALTER TABLE schedule_items ADD COLUMN display_order INTEGER DEFAULT 0"); } catch {}
try { sqlite.exec("ALTER TABLE schedule_items ADD COLUMN is_active INTEGER DEFAULT 1"); } catch {}
try { sqlite.exec("ALTER TABLE schedule_items ADD COLUMN created_at TEXT"); } catch {}

// Purge invalid 4th sports events (strictly 3 per gender)
try {
  sqlite.exec("DELETE FROM events WHERE id IN ('cricket-boys', 'volleyball-girls') OR slug IN ('cricket-boys', 'volleyball-girls')");
  sqlite.exec("DELETE FROM schedule_items WHERE event_id IN ('cricket-boys', 'volleyball-girls')");
  sqlite.exec("DELETE FROM results WHERE event_id IN ('cricket-boys', 'volleyball-girls')");
} catch {}

// Seed default admin accounts if not present
const seedAdmin = sqlite.prepare('SELECT id FROM admins WHERE email = ?');
const insertAdmin = sqlite.prepare(
  `INSERT OR IGNORE INTO admins (id, email, password_hash, name, role, is_active)
   VALUES (?, ?, ?, ?, ?, 1)`
);
if (!seedAdmin.get('admin@colorido.edu')) {
  insertAdmin.run('admin-1', 'admin@colorido.edu', bcrypt.hashSync('Colorido2026!', 10), 'COLORIDO Convener', 'super_admin');
}
if (!seedAdmin.get('admin@colorido2k26.com')) {
  insertAdmin.run('admin-2', 'admin@colorido2k26.com', bcrypt.hashSync('colorido@2026', 10), 'Chief Organizer', 'super_admin');
}

// Seed categories if empty
const catCount = (sqlite.prepare('SELECT COUNT(*) as c FROM event_categories').get() as any).c;
if (catCount === 0) {
  const insertCat = sqlite.prepare(
    `INSERT INTO event_categories (id, name, type, description, display_order, icon_name, color_scheme)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  for (const cat of seedCategories) {
    insertCat.run(cat.id, cat.name, cat.type, cat.description, cat.display_order, cat.icon_name, cat.color_scheme);
  }
}

// Seed events if empty
const evtCount = (sqlite.prepare('SELECT COUNT(*) as c FROM events').get() as any).c;
if (evtCount === 0) {
  const insertEvt = sqlite.prepare(
    `INSERT INTO events
      (id, slug, category_id, category_name, name, type, tagline, short_description,
       description, rules, venue, schedule_date, start_time, end_time, registration_type,
       min_team_size, max_team_size, team_size_label, gender, is_active, is_registration_open,
       registration_deadline, requires_audio, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const ev of seedEvents) {
    insertEvt.run(
      ev.id, ev.slug, ev.category_id, ev.category_name, ev.name, ev.type,
      ev.tagline, ev.short_description, ev.description, JSON.stringify(ev.rules),
      ev.venue, ev.schedule_date, ev.start_time, ev.end_time, ev.registration_type,
      ev.min_team_size, ev.max_team_size, ev.team_size_label, ev.gender,
      ev.is_active, ev.is_registration_open, ev.registration_deadline, ev.requires_audio,
      new Date().toISOString()
    );
  }
}

// Seed sample announcements if empty
const annCount = (sqlite.prepare('SELECT COUNT(*) as c FROM announcements').get() as any).c;
if (annCount === 0) {
  sqlite.prepare(`INSERT INTO announcements (id, title, content, category, is_urgent, is_ticker, link_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    'ann-1',
    'Registration Now Open for All Events!',
    'Online registration for all Cultural and Sports competitions is officially open. Register now directly on the portal and get your E-Pass!',
    'Urgent', 1, 1, '/register', new Date().toISOString()
  );
  sqlite.prepare(`INSERT INTO announcements (id, title, content, category, is_urgent, is_ticker, link_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    'ann-2',
    'Celebrity Night & Chief Guests Announced',
    'Renowned playback singers and DJ artists are lined up for the grand finale night at the RVR & JC Open Air Theatre.',
    'Cultural', 0, 1, '/schedule', new Date().toISOString()
  );
}

// Seed sample schedule if empty
const schCount = (sqlite.prepare('SELECT COUNT(*) as c FROM schedule_items').get() as any).c;
if (schCount === 0) {
  sqlite.prepare(`INSERT INTO schedule_items (id, title, description, event_type, venue, schedule_date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    'sch-1', 'Inaugural Ceremony & Lighting of the Lamp',
    'Welcome address by Principal, Management, and Chief Guests.',
    'ceremony', 'RVRJC Open Air Theatre (OAT)', '2026-02-26', '09:30', '11:00'
  );
  sqlite.prepare(`INSERT INTO schedule_items (id, title, description, event_type, venue, schedule_date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    'sch-2', 'Inter-College Cricket Preliminary Matches',
    'Round of 16 knockouts across ground A & B.',
    'sports', 'College Main Sports Complex', '2026-02-26', '11:00', '17:00'
  );
}

// ─── Seed Dummy Registrations (idempotent — only if table is empty) ──────────
const regCount = (sqlite.prepare('SELECT COUNT(*) as c FROM registrations').get() as any).c;
if (regCount === 0) {
  const insertReg = sqlite.prepare(`
    INSERT INTO registrations
      (id, registration_number, event_id, event_name, event_type, registration_type,
       participant_name, email, phone, college_name, roll_number, department,
       year_of_study, gender, team_name, team_members, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const dummyRegs = [
    // ── Cultural individual ──
    {
      id: 'dreg-001', regNo: 'CD26000001',
      eventId: 'classical-solo-dance', eventName: 'Classical / Folk Solo', eventType: 'cultural', regType: 'individual',
      name: 'Ananya Krishnamurthy', email: 'ananya.k@svec.edu.in', phone: '9876543210',
      college: 'SV Engineering College', roll: 'SVEC22CS043', dept: 'Computer Science (CSE)',
      year: '2nd Year', gender: 'Female', teamName: null, members: '[]', status: 'confirmed',
    },
    {
      id: 'dreg-002', regNo: 'CD26000002',
      eventId: 'slam-poetry', eventName: 'Slam Poetry & Spoken Word', eventType: 'cultural', regType: 'individual',
      name: 'Rahul Venkatesh', email: 'rahul.v@klu.edu.in', phone: '9876543211',
      college: 'KL University', roll: 'KLU23IT012', dept: 'Information Technology (IT)',
      year: '1st Year', gender: 'Male', teamName: null, members: '[]', status: 'confirmed',
    },
    {
      id: 'dreg-003', regNo: 'CD26000003',
      eventId: 'solo-vocals', eventName: 'Solo Vocals (Western / Eastern)', eventType: 'cultural', regType: 'individual',
      name: 'Priya Subramaniam', email: 'priya.s@andhrauniversity.edu.in', phone: '9876543212',
      college: 'Andhra University', roll: 'AU23ECE067', dept: 'Electronics & Comm (ECE)',
      year: '2nd Year', gender: 'Female', teamName: null, members: '[]', status: 'pending',
    },
    // ── Cultural team ──
    {
      id: 'dreg-004', regNo: 'CD26000004',
      eventId: 'western-group-dance', eventName: 'Western Group Dance', eventType: 'cultural', regType: 'team',
      name: 'Karthik Reddy', email: 'karthik.r@vrsiddhartha.ac.in', phone: '9876543213',
      college: 'VR Siddhartha Engineering College', roll: 'VRS22ME008', dept: 'Mechanical Engineering',
      year: '3rd Year', gender: 'Male',
      teamName: 'Rhythm Fusion Crew',
      members: JSON.stringify([
        { full_name: 'Karthik Reddy', roll_number: 'VRS22ME008', phone: '9876543213', college: 'VR Siddhartha Engineering College' },
        { full_name: 'Sravani Patel', roll_number: 'VRS22CSE021', phone: '9876543220', college: 'VR Siddhartha Engineering College' },
        { full_name: 'Aditya Sharma', roll_number: 'VRS22EEE034', phone: '9876543221', college: 'VR Siddhartha Engineering College' },
        { full_name: 'Mounika Rao', roll_number: 'VRS23IT055', phone: '9876543222', college: 'VR Siddhartha Engineering College' },
        { full_name: 'Vinay Kumar', roll_number: 'VRS22CSE077', phone: '9876543223', college: 'VR Siddhartha Engineering College' },
      ]),
      status: 'confirmed',
    },
    // ── Boys Sports ──
    {
      id: 'dreg-005', regNo: 'CD26000005',
      eventId: 'volleyball-boys', eventName: 'Volleyball Championship (Boys)', eventType: 'sports_boys', regType: 'team',
      name: 'Suresh Babu', email: 'suresh.b@jntuk.edu.in', phone: '9876543214',
      college: 'JNTU Kakinada', roll: 'JNTUK21EEE005', dept: 'Electrical & Electronics (EEE)',
      year: '4th Year', gender: 'Male',
      teamName: 'JNTUK Spikers',
      members: JSON.stringify([
        { full_name: 'Suresh Babu', roll_number: 'JNTUK21EEE005', phone: '9876543214', college: 'JNTU Kakinada' },
        { full_name: 'Ravi Teja', roll_number: 'JNTUK21ME012', phone: '9876543224', college: 'JNTU Kakinada' },
        { full_name: 'Siva Prasad', roll_number: 'JNTUK22CSE034', phone: '9876543225', college: 'JNTU Kakinada' },
        { full_name: 'Gopal Reddy', roll_number: 'JNTUK22IT056', phone: '9876543226', college: 'JNTU Kakinada' },
        { full_name: 'Naresh Kumar', roll_number: 'JNTUK21EEE078', phone: '9876543227', college: 'JNTU Kakinada' },
        { full_name: 'Vamsi Mohan', roll_number: 'JNTUK22ME090', phone: '9876543228', college: 'JNTU Kakinada' },
      ]),
      status: 'confirmed',
    },
    {
      id: 'dreg-006', regNo: 'CD26000006',
      eventId: 'basketball-boys', eventName: 'Basketball Championship (Boys)', eventType: 'sports_boys', regType: 'team',
      name: 'Arjun Mehta', email: 'arjun.m@gec.edu.in', phone: '9876543215',
      college: 'Gudlavalleru Engineering College', roll: 'GEC21CSE009', dept: 'Computer Science (CSE)',
      year: '4th Year', gender: 'Male',
      teamName: 'GEC Hoops',
      members: JSON.stringify([
        { full_name: 'Arjun Mehta', roll_number: 'GEC21CSE009', phone: '9876543215', college: 'Gudlavalleru Engineering College' },
        { full_name: 'Deepak Nair', roll_number: 'GEC22ME033', phone: '9876543229', college: 'Gudlavalleru Engineering College' },
        { full_name: 'Sanjay Rao', roll_number: 'GEC22EEE044', phone: '9876543230', college: 'Gudlavalleru Engineering College' },
        { full_name: 'Harish Babu', roll_number: 'GEC22IT055', phone: '9876543231', college: 'Gudlavalleru Engineering College' },
        { full_name: 'Akash Kumar', roll_number: 'GEC22CSE066', phone: '9876543232', college: 'Gudlavalleru Engineering College' },
      ]),
      status: 'pending',
    },
    {
      id: 'dreg-007', regNo: 'CD26000007',
      eventId: 'table-tennis-boys', eventName: 'Table Tennis Championship (Boys)', eventType: 'sports_boys', regType: 'individual',
      name: 'Pranav Iyer', email: 'pranav.i@vrsiddhartha.ac.in', phone: '9876543216',
      college: 'VR Siddhartha Engineering College', roll: 'VRS22IT021', dept: 'Information Technology (IT)',
      year: '3rd Year', gender: 'Male', teamName: null, members: '[]', status: 'confirmed',
    },
    // ── Girls Sports ──
    {
      id: 'dreg-008', regNo: 'CD26000008',
      eventId: 'throwball-girls', eventName: 'Throwball Championship (Girls)', eventType: 'sports_girls', regType: 'team',
      name: 'Divya Lakshmi', email: 'divya.l@rvrjc.ac.in', phone: '9876543217',
      college: 'RVR & JC College of Engineering', roll: 'RVRJC22CSE014', dept: 'Computer Science (CSE)',
      year: '3rd Year', gender: 'Female',
      teamName: 'RVRJC Throwball Queens',
      members: JSON.stringify([
        { full_name: 'Divya Lakshmi', roll_number: 'RVRJC22CSE014', phone: '9876543217', college: 'RVR & JC College of Engineering' },
        { full_name: 'Swathi Reddy', roll_number: 'RVRJC22ECE025', phone: '9876543233', college: 'RVR & JC College of Engineering' },
        { full_name: 'Madhuri Sai', roll_number: 'RVRJC23IT036', phone: '9876543234', college: 'RVR & JC College of Engineering' },
        { full_name: 'Pavani Devi', roll_number: 'RVRJC22CSE047', phone: '9876543235', college: 'RVR & JC College of Engineering' },
        { full_name: 'Sneha Rao', roll_number: 'RVRJC22EEE058', phone: '9876543236', college: 'RVR & JC College of Engineering' },
        { full_name: 'Keerthi G', roll_number: 'RVRJC23CSE069', phone: '9876543237', college: 'RVR & JC College of Engineering' },
        { full_name: 'Bhavana K', roll_number: 'RVRJC22ME080', phone: '9876543238', college: 'RVR & JC College of Engineering' },
      ]),
      status: 'confirmed',
    },
    {
      id: 'dreg-009', regNo: 'CD26000009',
      eventId: 'tennikoit-girls', eventName: 'Tennikoit Tournament (Girls)', eventType: 'sports_girls', regType: 'individual',
      name: 'Kavitha Nair', email: 'kavitha.n@svec.edu.in', phone: '9876543218',
      college: 'SV Engineering College', roll: 'SVEC22ECE098', dept: 'Electronics & Comm (ECE)',
      year: '3rd Year', gender: 'Female', teamName: null, members: '[]', status: 'confirmed',
    },
    {
      id: 'dreg-010', regNo: 'CD26000010',
      eventId: 'table-tennis-girls', eventName: 'Table Tennis Championship (Girls)', eventType: 'sports_girls', regType: 'individual',
      name: 'Shalini Verma', email: 'shalini.v@andhrauniversity.edu.in', phone: '9876543219',
      college: 'Andhra University', roll: 'AU23CSE011', dept: 'Computer Science (CSE)',
      year: '1st Year', gender: 'Female', teamName: null, members: '[]', status: 'cancelled',
    },
  ];

  const now = new Date();
  for (let i = 0; i < dummyRegs.length; i++) {
    const r = dummyRegs[i];
    // Stagger timestamps realistically over the past 7 days
    const createdAt = new Date(now.getTime() - (dummyRegs.length - i) * 14 * 60 * 60 * 1000);
    try {
      insertReg.run(
        r.id, r.regNo, r.eventId, r.eventName, r.eventType, r.regType,
        r.name, r.email, r.phone, r.college, r.roll, r.dept,
        r.year, r.gender, r.teamName, r.members, r.status, createdAt.toISOString()
      );
    } catch { /* ignore dupe on repeated startup */ }
  }
}

// Seed sample results if empty
const resCount = (sqlite.prepare('SELECT COUNT(*) as c FROM results').get() as any).c;
if (resCount === 0) {
  sqlite.prepare(`
    INSERT INTO results (id, category, event_id, event_name, position, winner_name, winner_college, description, first_place_team, first_place_college, second_place_team, second_place_college, third_place_team, third_place_college, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'res-1', 'Cultural - Dance', 'western-group-dance', 'Western Group Dance',
    '1st Place / Winner', 'Team BeatBusters', 'VR Siddhartha Engineering College',
    'Flawless synchronization, high-difficulty flips, and dynamic formations.',
    'Team BeatBusters', 'VR Siddhartha Engineering College',
    'Rhythm Squad', 'Andhra University',
    'Step Crafters', 'KL University',
    new Date().toISOString()
  );
  sqlite.prepare(`
    INSERT INTO results (id, category, event_id, event_name, position, winner_name, winner_college, description, first_place_team, first_place_college, second_place_team, second_place_college, third_place_team, third_place_college, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'res-2', 'Sports - Boys', 'cricket-boys', 'Inter-College Cricket Tournament',
    '1st Place / Winner', 'RVRJC Lions', 'RVR & JC College of Engineering',
    'Won by 24 runs in a thrilling final encounter.',
    'RVRJC Lions', 'RVR & JC College of Engineering',
    'JNTUK Strikers', 'JNTU Kakinada',
    'GEC Titans', 'Gudlavalleru Eng College',
    new Date().toISOString()
  );
}

// Seed sample gallery if empty
const galCount = (sqlite.prepare('SELECT COUNT(*) as c FROM gallery').get() as any).c;
if (galCount === 0) {
  sqlite.prepare(`INSERT INTO gallery (id, title, category, image_url, caption, year, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    'g-1', 'Grand Open Air Theatre Inaugural Ceremony', 'Cultural',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    'Over 5,000 students gathering under the lights at the iconic RVR & JC OAT.', '2025', new Date().toISOString()
  );
}

// Seed sample sponsors if empty
const spCount = (sqlite.prepare('SELECT COUNT(*) as c FROM sponsors').get() as any).c;
if (spCount === 0) {
  sqlite.prepare(`INSERT INTO sponsors (id, name, tier, logo_url, website_url, description) VALUES (?, ?, ?, ?, ?, ?)`).run(
    'sp-1', 'Tech Mahindra', 'title',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=500&q=80',
    'https://techmahindra.com', 'Title Presenting Sponsor of COLORIDO 2K26.'
  );
}
  } catch (err) {
    console.warn('SQLite fallback not available:', err);
  }

function tryParseJson(val: any): any {
  if (!val || typeof val !== 'string') return val ?? [];
  try { return JSON.parse(val); } catch { return []; }
}

// ── Universal Unified query() interface ──────────────────────────────────
export const query = async (text: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> => {
  // Try PostgreSQL first if available
  if (usePg || process.env.DATABASE_URL) {
    const res = await pgPool.query(text, params);
    return { rows: res.rows, rowCount: res.rowCount ?? res.rows.length };
  }

  if (!sqlite) {
    throw new Error('Database connection not available.');
  }

  const q = text.trim();
  const lowerQ = q.toLowerCase();

  // Convert PostgreSQL $1, $2, ... placeholders to SQLite ? and expand parameters correctly
  const matchedIndices: number[] = [];
  const sqliteSql = q.replace(/\$(\d+)/g, (_, idxStr) => {
    matchedIndices.push(parseInt(idxStr, 10) - 1);
    return '?';
  });

  const sqliteParams = matchedIndices.length > 0
    ? matchedIndices.map((i) => params[i])
    : params;

  try {
    const stmt = sqlite.prepare(sqliteSql);

    // If query has RETURNING clause (e.g. INSERT ... RETURNING * or UPDATE ... RETURNING *)
    if (lowerQ.includes('returning')) {
      const row = stmt.get(sqliteParams) as any;
      if (row) {
        if (typeof row.team_members === 'string') row.team_members = tryParseJson(row.team_members);
        if (typeof row.rules === 'string') row.rules = tryParseJson(row.rules);
      }
      return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
    }

    // If query is a SELECT
    if (lowerQ.startsWith('select')) {
      const rows = stmt.all(sqliteParams) as any[];
      for (const r of rows) {
        if (r) {
          if (typeof r.team_members === 'string') r.team_members = tryParseJson(r.team_members);
          if (typeof r.rules === 'string') r.rules = tryParseJson(r.rules);
        }
      }
      return { rows, rowCount: rows.length };
    }

    // If query is an INSERT without RETURNING
    if (lowerQ.startsWith('insert')) {
      const info = stmt.run(sqliteParams);
      return { rows: [{ id: info.lastInsertRowid }], rowCount: info.changes };
    }

    // If UPDATE or DELETE
    const info = stmt.run(sqliteParams);
    return { rows: [], rowCount: info.changes };
  } catch (err: any) {
    console.error('SQLite query error:', err, 'SQL:', sqliteSql, 'Params:', params);
    throw err;
  }
};

export const getClient = () => pgPool.connect();
export const getSqlite = (): any => sqlite;
export default pgPool;
