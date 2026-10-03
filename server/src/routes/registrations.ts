import { Router, Request, Response } from 'express';
import { query, getSqlite } from '../database/db';
import { body, validationResult } from 'express-validator';

const router = Router();

// ── Generate unique CD26XXXXXX registration number from Supabase PostgreSQL ─
async function generateRegNumber(): Promise<string> {
  try {
    // 1. Try using the atomic PostgreSQL sequence on Supabase
    try {
      await query(`CREATE SEQUENCE IF NOT EXISTS registration_number_seq START WITH 14`);
      const seqRes = await query(`SELECT nextval('registration_number_seq') as next_val`);
      if (seqRes.rows.length > 0 && seqRes.rows[0].next_val) {
        let val = parseInt(seqRes.rows[0].next_val, 10);
        let candidate = `CD26${String(val).padStart(6, '0')}`;

        // Ensure candidate does not already exist in registrations table
        let exists = await query('SELECT 1 FROM registrations WHERE registration_number = $1', [candidate]);
        while (exists.rows.length > 0) {
          const advRes = await query(`SELECT nextval('registration_number_seq') as next_val`);
          val = parseInt(advRes.rows[0].next_val, 10);
          candidate = `CD26${String(val).padStart(6, '0')}`;
          exists = await query('SELECT 1 FROM registrations WHERE registration_number = $1', [candidate]);
        }
        return candidate;
      }
    } catch (seqErr) {
      console.warn('PostgreSQL sequence query failed, trying MAX query:', seqErr);
    }

    // 2. Query MAX numeric registration number directly from Supabase PostgreSQL
    const maxRes = await query(`
      SELECT MAX(NULLIF(regexp_replace(registration_number, '^CD26', ''), '')::bigint) as max_num
      FROM registrations
      WHERE registration_number ~ '^CD26[0-9]+$'
    `);
    const maxNum = Number(maxRes.rows[0]?.max_num || 0);
    const nextNum = Math.max(maxNum + 1, 14);

    for (let i = nextNum; i < nextNum + 500; i++) {
      const candidate = `CD26${String(i).padStart(6, '0')}`;
      const check = await query('SELECT 1 FROM registrations WHERE registration_number = $1', [candidate]);
      if (check.rows.length === 0) {
        return candidate;
      }
    }

    return `CD26${String(Date.now()).slice(-6)}`;
  } catch (err) {
    console.error('generateRegNumber db error, using fallback:', err);
    return `CD26${String(Date.now()).slice(-6)}`;
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
      // ── Event deadline & open status check from Database ──────────────
      let resolvedEventId = event_id;
      let resolvedEventName = event_name;
      let resolvedEventType = event_type || 'cultural';
      let eventRow: any = null;

      try {
        const evRes = await query('SELECT * FROM events WHERE id::text = $1 OR slug = $2', [event_id, event_id]);
        if (evRes.rows.length > 0) {
          eventRow = evRes.rows[0];
        } else {
          if (event_type === 'sports_boys' || event_type === 'boys_sports' || event_type === 'boys') {
            const evRes2 = await query('SELECT * FROM events WHERE id::text = $1 OR slug = $2', [`${event_id}-boys`, `${event_id}-boys`]);
            if (evRes2.rows.length > 0) eventRow = evRes2.rows[0];
          } else if (event_type === 'sports_girls' || event_type === 'girls_sports' || event_type === 'girls') {
            const evRes2 = await query('SELECT * FROM events WHERE id::text = $1 OR slug = $2', [`${event_id}-girls`, `${event_id}-girls`]);
            if (evRes2.rows.length > 0) eventRow = evRes2.rows[0];
          }
        }
      } catch (evErr) {
        console.warn('Error fetching event row in registration:', evErr);
      }

      if (!eventRow) {
        try {
          const db = getSqlite();
          if (db) {
            eventRow = db.prepare('SELECT * FROM events WHERE id = ? OR slug = ?').get(event_id, event_id);
            if (!eventRow && (event_type === 'sports_boys' || event_type === 'boys_sports' || event_type === 'boys')) {
              eventRow = db.prepare('SELECT * FROM events WHERE id = ? OR slug = ?').get(`${event_id}-boys`, `${event_id}-boys`);
            } else if (!eventRow && (event_type === 'sports_girls' || event_type === 'girls_sports' || event_type === 'girls')) {
              eventRow = db.prepare('SELECT * FROM events WHERE id = ? OR slug = ?').get(`${event_id}-girls`, `${event_id}-girls`);
            }
          }
        } catch (sqliteErr) {
          console.warn('Error fetching event row in sqlite:', sqliteErr);
        }
      }

      // Backend event ID validation: event must exist in database
      if (!eventRow) {
        res.status(400).json({ error: 'Invalid event ID. The specified event does not exist.' });
        return;
      }

      // Validate event active state
      if (eventRow.is_active === false || eventRow.is_active === 0) {
        res.status(400).json({ error: 'This event is currently inactive and cannot accept registrations.' });
        return;
      }

      // Validate event registration open state
      if (eventRow.is_registration_open === false || eventRow.is_registration_open === 0) {
        res.status(400).json({ error: 'Registrations for this event are currently closed by the organizers.' });
        return;
      }

      // Validate event registration deadline
      if (eventRow.registration_deadline) {
        const deadlineTime = new Date(eventRow.registration_deadline).getTime();
        if (!isNaN(deadlineTime) && deadlineTime < Date.now()) {
          res.status(400).json({ error: 'Registration deadline has passed. Registrations for this event are closed.' });
          return;
        }
      }

      // Always lock to verified database record
      resolvedEventId = eventRow.slug || String(eventRow.id);
      resolvedEventName = eventRow.name;
      resolvedEventType = eventRow.type;

      if (resolvedEventType === 'boys_sports') resolvedEventType = 'sports_boys';
      if (resolvedEventType === 'girls_sports') resolvedEventType = 'sports_girls';

      // ── Strict Sports Validation (Requirement 17: exactly 3 sports per gender) ──
      const isBoysSport = resolvedEventType === 'sports_boys' ||
        eventRow?.category_name === 'Boys Sports' ||
        event_type === 'boysSports' ||
        event_type === 'sports_boys';

      if (isBoysSport) {
        const validBoys = ['volleyball-boys', 'basketball-boys', 'table-tennis-boys'];
        const match = validBoys.some(v =>
          resolvedEventId === v ||
          (eventRow && (eventRow.id === v || eventRow.slug === v)) ||
          resolvedEventId.includes(v.replace('-boys', ''))
        );
        if (!match) {
          res.status(400).json({ error: 'Invalid Boys Sports event. Permitted games are only Volleyball, Basketball, and Table Tennis.' });
          return;
        }
      }

      const isGirlsSport = resolvedEventType === 'sports_girls' ||
        eventRow?.category_name === 'Girls Sports' ||
        event_type === 'girlsSports' ||
        event_type === 'sports_girls';

      if (isGirlsSport) {
        const validGirls = ['throwball-girls', 'tennikoit-girls', 'table-tennis-girls'];
        const match = validGirls.some(v =>
          resolvedEventId === v ||
          (eventRow && (eventRow.id === v || eventRow.slug === v)) ||
          resolvedEventId.includes(v.replace('-girls', ''))
        );
        if (!match) {
          res.status(400).json({ error: 'Invalid Girls Sports event. Permitted games are only Throwball, Tennikoit, and Table Tennis.' });
          return;
        }
      }

      // Collect all identifiers for this specific event to prevent false positives across different events
      const eventIdsToCheck = Array.from(new Set([
        resolvedEventId,
        event_id,
        eventRow?.id ? String(eventRow.id) : null,
        eventRow?.slug || null
      ])).filter(Boolean);

      // ── Duplicate check: same email + same event ──────────────────────
      const dupResult = await query(
        `SELECT id FROM registrations WHERE event_id = ANY($1) AND LOWER(TRIM(email)) = LOWER(TRIM($2)) AND status != 'cancelled'`,
        [eventIdsToCheck, email]
      );
      if (dupResult.rows.length > 0) {
        res.status(409).json({
          error: 'You are already registered for this event with this email. Duplicate registrations are not allowed.',
        });
        return;
      }

      // ── Also check by roll number for the same event ───────────────────
      const dupRoll = await query(
        `SELECT id FROM registrations WHERE event_id = ANY($1) AND LOWER(TRIM(roll_number)) = LOWER(TRIM($2)) AND status != 'cancelled'`,
        [eventIdsToCheck, roll_number]
      );
      if (dupRoll.rows.length > 0) {
        res.status(409).json({
          error: 'A participant with this Roll Number is already registered for this event.',
        });
        return;
      }

      // ── For team events: check team captain phone for the same event ───
      if (registration_type === 'team' && team_name) {
        const dupPhone = await query(
          `SELECT id FROM registrations WHERE event_id = ANY($1) AND TRIM(phone) = TRIM($2) AND status != 'cancelled'`,
          [eventIdsToCheck, phone]
        );
        if (dupPhone.rows.length > 0) {
          res.status(409).json({
            error: 'A team captain with this phone number is already registered for this event.',
          });
          return;
        }
      }

      // ── Generate Unique Registration Number with Collision-Safe Retry Loop ─
      const teamMembersJson = JSON.stringify(team_members || []);
      let savedReg: any = null;
      let lastError: any = null;

      for (let attempt = 0; attempt < 5; attempt++) {
        const regId = `reg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const regNumber = await generateRegNumber();

        try {
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

          if (result.rows.length > 0) {
            savedReg = result.rows[0];
            break;
          }
        } catch (insertErr: any) {
          lastError = insertErr;
          // If collision on registration_number, loop and generate a new candidate
          const isRegNumCollision =
            insertErr?.code === '23505' &&
            (insertErr?.constraint === 'registrations_registration_number_key' ||
             insertErr?.detail?.includes('registration_number') ||
             String(insertErr?.message).includes('registration_number'));

          if (isRegNumCollision) {
            console.warn(`Registration number collision on attempt ${attempt + 1}, retrying...`);
            continue;
          }
          throw insertErr;
        }
      }

      if (!savedReg) {
        throw lastError || new Error('Could not persist registration.');
      }

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
      if (error?.code === '23505') {
        const constraint = error?.constraint || '';
        const detail = error?.detail || '';
        if (constraint === 'registrations_registration_number_key' || detail.includes('registration_number')) {
          res.status(500).json({ error: 'System is assigning registration numbers. Please retry submitting your registration.' });
        } else {
          res.status(409).json({ error: 'Duplicate registration detected. A registration with these details already exists.' });
        }
      } else {
        res.status(500).json({ error: error?.message || 'Registration failed. Please try again shortly.' });
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
