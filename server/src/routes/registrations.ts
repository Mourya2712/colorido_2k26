import { Router, Request, Response } from 'express';
import { query, getSqlite } from '../database/db';
import { body, validationResult } from 'express-validator';

const router = Router();

// ── Generate unique CD26XXXXXX registration number ────────────────────────
async function generateRegNumber(): Promise<string> {
  try {
    const db = getSqlite();
    const rows = db.prepare("SELECT registration_number FROM registrations").all() as any[];
    let maxNum = 0;
    for (const r of rows) {
      const match = (r.registration_number || '').match(/CD26(\d+)/);
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > maxNum) maxNum = n;
      }
    }
    const nextNum = maxNum > 0 ? maxNum + 1 : 1;
    return `CD26${String(nextNum).padStart(6, '0')}`;
  } catch {
    return `CD26${String(Math.floor(100000 + Math.random() * 900000))}`;
  }
}

// ── POST /api/registrations — Submit Registration ─────────────────────────
router.post(
  '/',
  [
    body('participant_name').notEmpty().trim().withMessage('Participant name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone')
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Enter a valid 10-digit Indian mobile number'),
    body('college_name').notEmpty().trim().withMessage('College name is required'),
    body('roll_number').notEmpty().trim().withMessage('Roll number / Student ID is required'),
    body('event_id').notEmpty().withMessage('Event ID is required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.array() });
      return;
    }

    const {
      event_id,
      event_name,
      event_type,
      registration_type,
      participant_name,
      email,
      phone,
      college_name,
      roll_number,
      department,
      year_of_study,
      gender,
      team_name,
      team_members = [],
      audio_file_url,
      audio_file_name,
    } = req.body;

    try {
      const db = getSqlite();

      // ── Event deadline & open status check ────────────────────────────
      let resolvedEventId = event_id;
      let resolvedEventName = event_name;
      let resolvedEventType = event_type || 'cultural';

      let eventRow = db.prepare('SELECT * FROM events WHERE id = ? OR slug = ?').get(event_id, event_id) as any;
      if (!eventRow) {
        if (event_type === 'sports_boys' || event_type === 'boys_sports' || event_type === 'boys') {
          eventRow = db.prepare('SELECT * FROM events WHERE id = ? OR slug = ?').get(`${event_id}-boys`, `${event_id}-boys`) as any;
        } else if (event_type === 'sports_girls' || event_type === 'girls_sports' || event_type === 'girls') {
          eventRow = db.prepare('SELECT * FROM events WHERE id = ? OR slug = ?').get(`${event_id}-girls`, `${event_id}-girls`) as any;
        }
      }

      if (eventRow) {
        resolvedEventId = eventRow.id;
        resolvedEventName = eventRow.name;
        resolvedEventType = eventRow.type;
        if (eventRow.is_registration_open === 0) {
          res.status(400).json({ error: 'Registrations for this event are currently closed by the organizers.' });
          return;
        }
        if (eventRow.registration_deadline) {
          const deadlineTime = new Date(eventRow.registration_deadline).getTime();
          if (!isNaN(deadlineTime) && deadlineTime < Date.now()) {
            res.status(400).json({ error: 'Registration deadline has passed. Registrations for this event are closed.' });
            return;
          }
        }
      }

      if (resolvedEventType === 'boys_sports') resolvedEventType = 'sports_boys';
      if (resolvedEventType === 'girls_sports') resolvedEventType = 'sports_girls';

      // ── Strict Sports Validation (Requirement 17: exactly 3 sports per gender) ──
      if (resolvedEventType === 'sports_boys' || eventRow?.category_id === 'boys-sports' || event_type === 'boysSports') {
        const validBoys = ['volleyball-boys', 'basketball-boys', 'table-tennis-boys'];
        const match = validBoys.some(v => resolvedEventId === v || (eventRow && eventRow.id === v) || resolvedEventId.includes(v.replace('-boys', '')));
        if (!match) {
          res.status(400).json({ error: 'Invalid Boys Sports event. Permitted games are only Volleyball, Basketball, and Table Tennis.' });
          return;
        }
      }
      if (resolvedEventType === 'sports_girls' || eventRow?.category_id === 'girls-sports' || event_type === 'girlsSports') {
        const validGirls = ['throwball-girls', 'tennikoit-girls', 'table-tennis-girls'];
        const match = validGirls.some(v => resolvedEventId === v || (eventRow && eventRow.id === v) || resolvedEventId.includes(v.replace('-girls', '')));
        if (!match) {
          res.status(400).json({ error: 'Invalid Girls Sports event. Permitted games are only Throwball, Tennikoit, and Table Tennis.' });
          return;
        }
      }

      // ── Duplicate check: same email + same event ──────────────────────
      const dupResult = await query(
        `SELECT id FROM registrations WHERE (event_id = $1 OR event_id = $2) AND LOWER(email) = LOWER($3) AND status != 'cancelled'`,
        [resolvedEventId, event_id, email]
      );
      if (dupResult.rows.length > 0) {
        res.status(409).json({
          error: 'You are already registered for this event. Duplicate registrations are not allowed.',
        });
        return;
      }

      // ── Also check by roll number to prevent another form of duplicate ─
      const dupRoll = await query(
        `SELECT id FROM registrations WHERE (event_id = $1 OR event_id = $2) AND LOWER(roll_number) = LOWER($3) AND status != 'cancelled'`,
        [resolvedEventId, event_id, roll_number]
      );
      if (dupRoll.rows.length > 0) {
        res.status(409).json({
          error: 'A participant with this Roll Number is already registered for this event.',
        });
        return;
      }

      // ── For team events: also check team captain phone ────────────────
      if (registration_type === 'team' && team_name) {
        const dupPhone = await query(
          `SELECT id FROM registrations WHERE (event_id = $1 OR event_id = $2) AND phone = $3 AND status != 'cancelled'`,
          [resolvedEventId, event_id, phone]
        );
        if (dupPhone.rows.length > 0) {
          res.status(409).json({
            error: 'A team captain with this phone number is already registered for this event.',
          });
          return;
        }
      }

      const regId = `reg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const regNumber = await generateRegNumber();
      const teamMembersJson = JSON.stringify(team_members || []);

      const result = await query(
        `INSERT INTO registrations
          (id, registration_number, event_id, event_name, event_type, registration_type,
           participant_name, email, phone, college_name, roll_number, department,
           year_of_study, gender, team_name, team_members, audio_file_url, audio_file_name, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 'confirmed', $19)
         RETURNING *`,
        [
          regId,
          regNumber,
          resolvedEventId,
          resolvedEventName || 'Festival Event',
          resolvedEventType,
          registration_type || (eventRow?.registration_type || 'individual'),
          participant_name,
          email,
          phone,
          college_name,
          roll_number,
          department || null,
          year_of_study || null,
          gender || null,
          team_name || null,
          teamMembersJson,
          audio_file_url || null,
          audio_file_name || null,
          new Date().toISOString(),
        ]
      );

      const savedReg = result.rows[0];

      res.status(201).json({
        success: true,
        message: 'Registration successful! Welcome to COLORIDO 2K26.',
        registration: {
          id: savedReg.id,
          registration_number: savedReg.registration_number,
          event_name: savedReg.event_name,
          event_type: savedReg.event_type,
          registration_type: savedReg.registration_type,
          participant_name: savedReg.participant_name,
          email: savedReg.email,
          phone: savedReg.phone,
          college_name: savedReg.college_name,
          roll_number: savedReg.roll_number,
          department: savedReg.department,
          year_of_study: savedReg.year_of_study,
          gender: savedReg.gender,
          team_name: savedReg.team_name,
          team_members: typeof savedReg.team_members === 'string'
            ? JSON.parse(savedReg.team_members || '[]')
            : savedReg.team_members,
          audio_file_url: savedReg.audio_file_url,
          audio_file_name: savedReg.audio_file_name,
          status: savedReg.status,
          created_at: savedReg.created_at,
        },
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error?.code === '23505' || error?.message?.includes('UNIQUE')) {
        res.status(409).json({ error: 'Duplicate registration detected. Please check your details.' });
      } else {
        res.status(500).json({ error: 'Registration failed. Please try again shortly.' });
      }
    }
  }
);

// ── GET /api/registrations/:regNumber — Public lookup ────────────────────
router.get('/:regNumber', async (req: Request, res: Response): Promise<void> => {
  const { regNumber } = req.params;
  if (!regNumber) {
    res.status(400).json({ error: 'Registration number is required' });
    return;
  }

  try {
    const result = await query(
      `SELECT r.*, e.venue as venue, e.schedule_date as event_date, e.start_time as start_time, e.category_name as category_name
       FROM registrations r
       LEFT JOIN events e ON (e.id::text = r.event_id OR e.slug = r.event_id)
       WHERE UPPER(r.registration_number) = UPPER($1) OR r.id = $1`,
      [regNumber]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }
    const reg = result.rows[0];
    res.json({
      registration: {
        ...reg,
        team_members: typeof reg.team_members === 'string'
          ? JSON.parse(reg.team_members || '[]')
          : reg.team_members,
      },
    });
  } catch (error) {
    console.error('Lookup error:', error);
    res.status(500).json({ error: 'Failed to fetch registration' });
  }
});

export default router;
