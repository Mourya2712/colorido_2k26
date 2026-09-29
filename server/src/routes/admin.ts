import { Router, Request, Response } from 'express';
import { query, getSqlite } from '../database/db';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// All admin routes require authentication
router.use(authenticateAdmin as (req: Request, res: Response, next: () => void) => void);

// ── Dashboard Stats ───────────────────────────────────────────────
router.get('/dashboard', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (process.env.DATABASE_URL) {
      try {
        const totalRes = await query(`SELECT COUNT(*) as c FROM registrations WHERE status != 'cancelled'`);
        const total = Number(totalRes.rows[0]?.c || 0);
        const teamsRes = await query(`SELECT COUNT(*) as c FROM registrations WHERE registration_type = 'team' AND status != 'cancelled'`);
        const teams = Number(teamsRes.rows[0]?.c || 0);
        const indRes = await query(`SELECT COUNT(*) as c FROM registrations WHERE registration_type = 'individual' AND status != 'cancelled'`);
        const individuals = Number(indRes.rows[0]?.c || 0);
        const cultRes = await query(`SELECT COUNT(*) as c FROM registrations WHERE (event_type = 'cultural' OR event_type = 'Cultural') AND status != 'cancelled'`);
        const cultural = Number(cultRes.rows[0]?.c || 0);
        const boysRes = await query(`SELECT COUNT(*) as c FROM registrations WHERE (event_type = 'sports_boys' OR event_type = 'boysSports' OR event_type = 'Boys Sports') AND status != 'cancelled'`);
        const boysSports = Number(boysRes.rows[0]?.c || 0);
        const girlsRes = await query(`SELECT COUNT(*) as c FROM registrations WHERE (event_type = 'sports_girls' OR event_type = 'girlsSports' OR event_type = 'Girls Sports') AND status != 'cancelled'`);
        const girlsSports = Number(girlsRes.rows[0]?.c || 0);
        const pendingRes = await query(`SELECT COUNT(*) as c FROM registrations WHERE status = 'pending'`);
        const pending = Number(pendingRes.rows[0]?.c || 0);
        const confRes = await query(`SELECT COUNT(*) as c FROM registrations WHERE status = 'confirmed'`);
        const confirmed = Number(confRes.rows[0]?.c || 0);
        const evCountRes = await query(`SELECT COUNT(*) as c FROM events WHERE is_active = TRUE`);
        const totalEvents = Number(evCountRes.rows[0]?.c || 0);

        const recentRes = await query(`
          SELECT r.*, e.category_name as category, e.venue as venue, e.schedule_date as event_date, e.start_time as event_start_time
          FROM registrations r
          LEFT JOIN events e ON (e.id::text = r.event_id OR e.slug = r.event_id)
          WHERE r.status != 'cancelled'
          ORDER BY r.created_at DESC
          LIMIT 10
        `);

        res.json({
          stats: {
            total_registrations: total,
            totalRegistrations: total,
            total_teams: teams,
            total_participants: individuals,
            cultural_registrations: cultural,
            culturalCount: cultural,
            boys_sports_registrations: boysSports,
            boysSportsCount: boysSports,
            girls_sports_registrations: girlsSports,
            girlsSportsCount: girlsSports,
            sports_registrations: boysSports + girlsSports,
            sportsCount: boysSports + girlsSports,
            pending_registrations: pending,
            pendingCount: pending,
            confirmed_registrations: confirmed,
            confirmedCount: confirmed,
            total_events: totalEvents,
          },
          recentRegistrations: recentRes.rows.map((r: any) => ({
            ...r,
            team_members: tryParseJson(r.team_members),
          })),
        });
        return;
      } catch (err) {
        console.warn('Postgres dashboard query error, checking sqlite:', err);
      }
    }

    const db = getSqlite();
    const total = (db.prepare(`SELECT COUNT(*) as c FROM registrations WHERE status != 'cancelled'`).get() as any).c;
    const teams = (db.prepare("SELECT COUNT(*) as c FROM registrations WHERE registration_type = 'team' AND status != 'cancelled'").get() as any).c;
    const individuals = (db.prepare("SELECT COUNT(*) as c FROM registrations WHERE registration_type = 'individual' AND status != 'cancelled'").get() as any).c;
    const cultural = (db.prepare("SELECT COUNT(*) as c FROM registrations WHERE (event_type = 'cultural' OR event_type = 'Cultural') AND status != 'cancelled'").get() as any).c;
    const boysSports = (db.prepare("SELECT COUNT(*) as c FROM registrations WHERE (event_type = 'sports_boys' OR event_type = 'boysSports' OR event_type = 'Boys Sports') AND status != 'cancelled'").get() as any).c;
    const girlsSports = (db.prepare("SELECT COUNT(*) as c FROM registrations WHERE (event_type = 'sports_girls' OR event_type = 'girlsSports' OR event_type = 'Girls Sports') AND status != 'cancelled'").get() as any).c;
    const pending = (db.prepare("SELECT COUNT(*) as c FROM registrations WHERE status = 'pending'").get() as any).c;
    const confirmed = (db.prepare("SELECT COUNT(*) as c FROM registrations WHERE status = 'confirmed'").get() as any).c;
    const totalEvents = (db.prepare('SELECT COUNT(*) as c FROM events WHERE is_active = 1').get() as any).c;

    const recentRows = db.prepare(`
      SELECT r.*, e.category_name as category, e.venue as venue, e.schedule_date as event_date, e.start_time as event_start_time
      FROM registrations r
      LEFT JOIN events e ON (e.id = r.event_id OR e.slug = r.event_id)
      WHERE r.status != 'cancelled'
      ORDER BY r.created_at DESC
      LIMIT 10
    `).all() as any[];

    res.json({
      stats: {
        total_registrations: total,
        totalRegistrations: total,
        total_teams: teams,
        total_participants: individuals,
        cultural_registrations: cultural,
        culturalCount: cultural,
        boys_sports_registrations: boysSports,
        boysSportsCount: boysSports,
        girls_sports_registrations: girlsSports,
        girlsSportsCount: girlsSports,
        sports_registrations: boysSports + girlsSports,
        sportsCount: boysSports + girlsSports,
        pending_registrations: pending,
        pendingCount: pending,
        confirmed_registrations: confirmed,
        confirmedCount: confirmed,
        total_events: totalEvents,
      },
      recentRegistrations: recentRows.map((r: any) => ({
        ...r,
        team_members: tryParseJson(r.team_members),
      })),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// ── Registrations Management ──────────────────────────────────────
router.get('/registrations', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, event_type, search } = req.query;

    if (process.env.DATABASE_URL) {
      try {
        let pgSql = `
          SELECT r.*, e.category_name as category, e.venue as venue, e.schedule_date as event_date, e.start_time as event_start_time, e.end_time as event_end_time
          FROM registrations r
          LEFT JOIN events e ON (e.id::text = r.event_id OR e.slug = r.event_id)
          WHERE 1=1
        `;
        const pgParams: any[] = [];
        let pIdx = 1;

        if (status && status !== 'all') { pgSql += ` AND r.status = $${pIdx++}`; pgParams.push(status); }
        if (event_type && event_type !== 'all') {
          if (event_type === 'cultural') {
            pgSql += ` AND (r.event_type = 'cultural' OR r.event_type = 'Cultural')`;
          } else if (event_type === 'boysSports' || event_type === 'sports_boys') {
            pgSql += ` AND (r.event_type = 'sports_boys' OR r.event_type = 'boysSports' OR r.event_type = 'Boys Sports')`;
          } else if (event_type === 'girlsSports' || event_type === 'sports_girls') {
            pgSql += ` AND (r.event_type = 'sports_girls' OR r.event_type = 'girlsSports' OR r.event_type = 'Girls Sports')`;
          } else {
            pgSql += ` AND r.event_type = $${pIdx++}`; pgParams.push(event_type);
          }
        }
        if (search) {
          const s = `%${search}%`;
          pgSql += ` AND (r.registration_number ILIKE $${pIdx} OR r.participant_name ILIKE $${pIdx} OR r.email ILIKE $${pIdx} OR r.college_name ILIKE $${pIdx} OR r.roll_number ILIKE $${pIdx} OR r.team_name ILIKE $${pIdx} OR r.event_name ILIKE $${pIdx})`;
          pgParams.push(s);
          pIdx++;
        }

        pgSql += ' ORDER BY r.created_at DESC';

        const resPg = await query(pgSql, pgParams);
        const rows = resPg.rows.map((r: any) => {
          r.team_members = tryParseJson(r.team_members);
          return r;
        });

        res.json({
          registrations: rows,
          pagination: { total: rows.length, page: 1, limit: rows.length, pages: 1 },
        });
        return;
      } catch (err) {
        console.warn('Postgres admin registrations query error, falling back to sqlite:', err);
      }
    }

    const db = getSqlite();
    let sql = `
      SELECT r.*, e.category_name as category, e.venue as venue, e.schedule_date as event_date, e.start_time as event_start_time, e.end_time as event_end_time
      FROM registrations r
      LEFT JOIN events e ON (e.id = r.event_id OR e.slug = r.event_id)
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'all') { sql += ` AND r.status = ?`; params.push(status); }
    if (event_type && event_type !== 'all') {
      if (event_type === 'cultural') {
        sql += ` AND (r.event_type = 'cultural' OR r.event_type = 'Cultural')`;
      } else if (event_type === 'boysSports' || event_type === 'sports_boys') {
        sql += ` AND (r.event_type = 'sports_boys' OR r.event_type = 'boysSports' OR r.event_type = 'Boys Sports')`;
      } else if (event_type === 'girlsSports' || event_type === 'sports_girls') {
        sql += ` AND (r.event_type = 'sports_girls' OR r.event_type = 'girlsSports' OR r.event_type = 'Girls Sports')`;
      } else {
        sql += ` AND r.event_type = ?`; params.push(event_type);
      }
    }
    if (search) {
      const s = `%${search}%`;
      sql += ` AND (r.registration_number LIKE ? OR r.participant_name LIKE ? OR r.email LIKE ? OR r.college_name LIKE ? OR r.roll_number LIKE ? OR r.team_name LIKE ? OR r.event_name LIKE ?)`;
      params.push(s, s, s, s, s, s, s);
    }

    sql += ' ORDER BY r.created_at DESC';

    const rows = (db.prepare(sql).all(...params) as any[]).map((r: any) => {
      r.team_members = tryParseJson(r.team_members);
      return r;
    });

    res.json({
      registrations: rows,
      pagination: { total: rows.length, page: 1, limit: rows.length, pages: 1 },
    });
  } catch (error) {
    console.error('Admin registrations error:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// GET single registration
router.get('/registrations/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (process.env.DATABASE_URL) {
      try {
        const resPg = await query(`
          SELECT r.*, e.category_name as category, e.venue as venue, e.schedule_date as event_date, e.start_time as event_start_time, e.end_time as event_end_time
          FROM registrations r
          LEFT JOIN events e ON (e.id::text = r.event_id OR e.slug = r.event_id)
          WHERE r.id = $1 OR r.registration_number = $1
        `, [req.params.id]);
        if (resPg.rows.length > 0) {
          const row = resPg.rows[0];
          row.team_members = tryParseJson(row.team_members);
          res.json({ registration: row });
          return;
        }
      } catch (err) {
        console.warn('Postgres single reg query error:', err);
      }
    }

    const db = getSqlite();
    const row = db.prepare(`
      SELECT r.*, e.category_name as category, e.venue as venue, e.schedule_date as event_date, e.start_time as event_start_time, e.end_time as event_end_time
      FROM registrations r
      LEFT JOIN events e ON (e.id = r.event_id OR e.slug = r.event_id)
      WHERE r.id = ? OR r.registration_number = ?
    `).get(req.params.id, req.params.id) as any;

    if (!row) { res.status(404).json({ error: 'Registration not found' }); return; }
    row.team_members = tryParseJson(row.team_members);
    res.json({ registration: row });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch registration' });
  }
});

// PATCH update registration status
router.patch('/registrations/:id/status', async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, notes } = req.body;
  const validStatuses = ['pending', 'confirmed', 'rejected', 'cancelled'];
  if (!validStatuses.includes(status)) { res.status(400).json({ error: 'Invalid status' }); return; }

  try {
    if (process.env.DATABASE_URL) {
      try {
        await query(
          'UPDATE registrations SET status = $1, notes = COALESCE($2, notes) WHERE id = $3 OR registration_number = $3',
          [status, notes || null, req.params.id]
        );
      } catch (err) {
        console.warn('Postgres status update error:', err);
      }
    }

    const db = getSqlite();
    db.prepare('UPDATE registrations SET status = ?, notes = COALESCE(?, notes) WHERE id = ? OR registration_number = ?')
      .run(status, notes || null, req.params.id, req.params.id);
    const updated = db.prepare('SELECT * FROM registrations WHERE id = ? OR registration_number = ?')
      .get(req.params.id, req.params.id) as any;
    if (!updated) { res.status(404).json({ error: 'Not found' }); return; }
    updated.team_members = tryParseJson(updated.team_members);
    res.json({ success: true, registration: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update registration' });
  }
});

function parseRules(val: any): string[] {
  if (Array.isArray(val)) return val;
  if (!val || typeof val !== 'string') return [];
  try {
    const parsed = JSON.parse(val);
    if (Array.isArray(parsed)) return parsed;
    return [String(parsed)];
  } catch {
    return [val];
  }
}

// ── Events Management (PostgreSQL & SQLite CRUD & LIVE SYNC) ──────
router.get('/events', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (process.env.DATABASE_URL) {
      try {
        const pgRows = await query(`
          SELECT e.*, COUNT(r.id) as reg_count
          FROM events e
          LEFT JOIN registrations r ON (r.event_id = e.id::text OR r.event_id = e.slug) AND r.status != 'cancelled'
          WHERE e.is_active = TRUE
          GROUP BY e.id
          ORDER BY e.category_name ASC, e.name ASC
        `);
        const processed = pgRows.rows.map((ev: any) => ({
          ...ev,
          rules: parseRules(ev.rules),
          reg_count: Number(ev.reg_count || 0),
        }));
        res.json({ events: processed });
        return;
      } catch (err) {
        console.warn('Postgres admin events error:', err);
      }
    }

    const db = getSqlite();
    if (db) {
      const rows = db.prepare(`
        SELECT e.*, COUNT(r.id) as reg_count
        FROM events e
        LEFT JOIN registrations r ON (r.event_id = e.id OR r.event_id = e.slug) AND r.status != 'cancelled'
        WHERE e.is_active = 1
        GROUP BY e.id
        ORDER BY e.category_name ASC, e.name ASC
      `).all() as any[];

      const processed = rows.map((ev: any) => ({
        ...ev,
        rules: parseRules(ev.rules),
        reg_count: Number(ev.reg_count || 0),
      }));

      res.json({ events: processed });
      return;
    }

    res.json({ events: [] });
  } catch (error) {
    console.error('Admin events fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.post('/events', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name, slug, category_id, category_name, type = 'cultural',
      tagline, short_description, description, rules = [],
      venue, schedule_date, start_time, end_time, registration_type = 'individual',
      min_team_size = 1, max_team_size = 1, team_size_label, gender = 'all',
      is_registration_open = 1, registration_deadline, requires_audio = 0
    } = req.body;

    if (!name || !category_id) {
      res.status(400).json({ error: 'Name and category are required' });
      return;
    }

    const eventSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const rulesJson = JSON.stringify(Array.isArray(rules) ? rules : [rules]);

    if (process.env.DATABASE_URL) {
      try {
        const pgRes = await query(`
          INSERT INTO events
            (slug, category_name, name, type, tagline, short_description,
             description, rules, venue, schedule_date, start_time, end_time, registration_type,
             min_team_size, max_team_size, team_size_label, gender, is_active, is_registration_open,
             registration_deadline, requires_audio, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, TRUE, $18, $19, $20, NOW())
          RETURNING *
        `, [
          eventSlug, category_name || category_id, name, type,
          tagline || null, short_description || null, description || null, rulesJson,
          venue || 'RVRJC Open Air Theatre (OAT)', schedule_date || '2026-02-26',
          start_time || '10:00', end_time || '13:00', registration_type,
          Number(min_team_size), Number(max_team_size), team_size_label || `${min_team_size} - ${max_team_size} Members`,
          gender, Boolean(is_registration_open), registration_deadline || '2026-10-15T23:59:59.000Z',
          Boolean(requires_audio)
        ]);

        if (pgRes.rows.length) {
          const ev = pgRes.rows[0];
          ev.rules = parseRules(ev.rules);
          res.status(201).json({ event: ev });
          return;
        }
      } catch (err) {
        console.warn('Postgres create event error:', err);
      }
    }

    const db = getSqlite();
    if (db) {
      db.prepare(`
        INSERT INTO events
          (id, slug, category_id, category_name, name, type, tagline, short_description,
           description, rules, venue, schedule_date, start_time, end_time, registration_type,
           min_team_size, max_team_size, team_size_label, gender, is_active, is_registration_open,
           registration_deadline, requires_audio, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
      `).run(
        id, eventSlug, category_id, category_name || category_id, name, type,
        tagline || null, short_description || null, description || null, rulesJson,
        venue || 'RVRJC Open Air Theatre (OAT)', schedule_date || '2026-02-26',
        start_time || '10:00', end_time || '13:00', registration_type,
        min_team_size, max_team_size, team_size_label || `${min_team_size} - ${max_team_size} Members`,
        gender, is_registration_open ? 1 : 0, registration_deadline || '2026-10-15T23:59:59.000Z',
        requires_audio ? 1 : 0, new Date().toISOString()
      );

      const created = db.prepare('SELECT * FROM events WHERE id = ?').get(id) as any;
      if (created) created.rules = parseRules(created.rules);

      res.status(201).json({ event: created });
      return;
    }

    res.status(500).json({ error: 'Database not available' });
  } catch (error) {
    console.error('Admin create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

router.patch('/events/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name, category_name, category_id, type, tagline, short_description,
      description, rules, venue, schedule_date, start_time, end_time,
      registration_type, min_team_size, max_team_size, team_size_label,
      gender, is_registration_open, registration_deadline, requires_audio, is_active
    } = req.body;

    const rulesJson = rules !== undefined ? (typeof rules === 'string' ? rules : JSON.stringify(rules)) : undefined;

    if (process.env.DATABASE_URL) {
      try {
        const pgRes = await query(`
          UPDATE events SET
            name = COALESCE($1, name),
            category_name = COALESCE($2, category_name),
            type = COALESCE($3, type),
            tagline = COALESCE($4, tagline),
            short_description = COALESCE($5, short_description),
            description = COALESCE($6, description),
            rules = COALESCE($7, rules),
            venue = COALESCE($8, venue),
            schedule_date = COALESCE($9, schedule_date),
            start_time = COALESCE($10, start_time),
            end_time = COALESCE($11, end_time),
            registration_type = COALESCE($12, registration_type),
            min_team_size = COALESCE($13, min_team_size),
            max_team_size = COALESCE($14, max_team_size),
            team_size_label = COALESCE($15, team_size_label),
            gender = COALESCE($16, gender),
            is_registration_open = COALESCE($17, is_registration_open),
            registration_deadline = COALESCE($18, registration_deadline),
            requires_audio = COALESCE($19, requires_audio),
            is_active = COALESCE($20, is_active),
            updated_at = NOW()
          WHERE id::text = $21 OR slug = $21
          RETURNING *
        `, [
          name, category_name, type, tagline, short_description, description,
          rulesJson, venue, schedule_date, start_time, end_time, registration_type,
          min_team_size !== undefined ? Number(min_team_size) : null,
          max_team_size !== undefined ? Number(max_team_size) : null,
          team_size_label, gender,
          is_registration_open !== undefined ? Boolean(is_registration_open) : null,
          registration_deadline,
          requires_audio !== undefined ? Boolean(requires_audio) : null,
          is_active !== undefined ? Boolean(is_active) : null,
          req.params.id
        ]);

        if (pgRes.rows.length) {
          const ev = pgRes.rows[0];
          ev.rules = parseRules(ev.rules);
          res.json({ event: ev, message: 'Event updated successfully' });
          return;
        }
      } catch (err) {
        console.warn('Postgres update event error:', err);
      }
    }

    const db = getSqlite();
    if (db) {
      const existing = db.prepare('SELECT * FROM events WHERE id = ? OR slug = ?').get(req.params.id, req.params.id) as any;
      if (!existing) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }

      const deadlineUpdated = registration_deadline !== undefined && registration_deadline !== existing.registration_deadline
        ? new Date().toISOString()
        : existing.registration_deadline_updated_at;

      db.prepare(`
        UPDATE events SET
          name = ?, category_name = ?, category_id = ?, type = ?, tagline = ?,
          short_description = ?, description = ?, rules = ?, venue = ?, schedule_date = ?,
          start_time = ?, end_time = ?, registration_type = ?, min_team_size = ?,
          max_team_size = ?, team_size_label = ?, gender = ?, is_registration_open = ?,
          registration_deadline = ?, registration_deadline_updated_at = ?,
          requires_audio = ?, is_active = ?
        WHERE id = ?
      `).run(
        name ?? existing.name, category_name ?? existing.category_name, category_id ?? existing.category_id,
        type ?? existing.type, tagline !== undefined ? tagline : existing.tagline,
        short_description ?? existing.short_description, description ?? existing.description,
        rulesJson ?? existing.rules, venue ?? existing.venue, schedule_date ?? existing.schedule_date,
        start_time ?? existing.start_time, end_time ?? existing.end_time,
        registration_type ?? existing.registration_type,
        min_team_size !== undefined ? Number(min_team_size) : existing.min_team_size,
        max_team_size !== undefined ? Number(max_team_size) : existing.max_team_size,
        team_size_label ?? existing.team_size_label, gender ?? existing.gender,
        is_registration_open !== undefined ? (is_registration_open ? 1 : 0) : existing.is_registration_open,
        registration_deadline !== undefined ? registration_deadline : existing.registration_deadline,
        deadlineUpdated, requires_audio !== undefined ? (requires_audio ? 1 : 0) : existing.requires_audio,
        is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
        existing.id
      );

      const updated = db.prepare('SELECT * FROM events WHERE id = ?').get(existing.id) as any;
      if (updated) updated.rules = parseRules(updated.rules);

      res.json({ event: updated, message: 'Event updated successfully' });
      return;
    }

    res.status(404).json({ error: 'Event not found' });
  } catch (error) {
    console.error('Admin update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

router.delete('/events/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (process.env.DATABASE_URL) {
      try {
        await query('UPDATE events SET is_active = FALSE WHERE id::text = $1 OR slug = $1', [req.params.id]);
      } catch (err) {
        console.warn('Postgres delete event error:', err);
      }
    }

    const db = getSqlite();
    if (db) {
      db.prepare('UPDATE events SET is_active = 0 WHERE id = ? OR slug = ?').run(req.params.id, req.params.id);
    }

    res.json({ success: true, message: 'Event deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deactivate event' });
  }
});

// ── Announcements Management ──────────────────────────────────────
router.get('/announcements', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT * FROM announcements ORDER BY created_at DESC', []);
    res.json({ announcements: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

router.post('/announcements', async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, content, category = 'General', is_urgent = false, is_ticker = true, link_url } = req.body;
  if (!title || !content) { res.status(400).json({ error: 'title and content are required' }); return; }
  try {
    const result = await query(
      'INSERT INTO announcements (title, content, category, is_urgent, is_ticker, link_url, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, content, category, is_urgent, is_ticker, link_url || null, new Date().toISOString()]
    );
    res.status(201).json({ announcement: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

router.patch('/announcements/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const db = getSqlite();
    const { title, content, category, is_urgent, is_ticker, link_url } = req.body;
    const existing = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
    db.prepare(
      'UPDATE announcements SET title = ?, content = ?, category = ?, is_urgent = ?, is_ticker = ?, link_url = ? WHERE id = ?'
    ).run(
      title ?? existing.title, content ?? existing.content, category ?? existing.category,
      is_urgent !== undefined ? (is_urgent ? 1 : 0) : existing.is_urgent,
      is_ticker !== undefined ? (is_ticker ? 1 : 0) : existing.is_ticker,
      link_url !== undefined ? link_url : existing.link_url,
      req.params.id
    );
    const updated = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);
    res.json({ announcement: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

router.delete('/announcements/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await query('DELETE FROM announcements WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

// ── Schedule Management ───────────────────────────────────────────
router.get('/schedule', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (process.env.DATABASE_URL) {
      try {
        const pgRows = await query(`
          SELECT si.*, e.name as event_name, e.category_name as category
          FROM schedule_items si
          LEFT JOIN events e ON (e.id::text = si.event_id OR e.slug = si.event_id)
          WHERE si.is_active = TRUE
          ORDER BY si.schedule_date ASC, si.start_time ASC
        `);
        res.json({ schedule: pgRows.rows });
        return;
      } catch (err) {
        console.warn('Admin schedule PG error:', err);
      }
    }
    const db = getSqlite();
    const rows = db.prepare(`
      SELECT si.*, e.name as event_name, e.category_name as category
      FROM schedule_items si
      LEFT JOIN events e ON (e.id = si.event_id OR e.slug = si.event_id)
      WHERE si.is_active = 1
      ORDER BY si.schedule_date ASC, si.start_time ASC
    `).all();
    res.json({ schedule: rows });
  } catch (error) {
    console.error('Admin schedule fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

router.post('/schedule', async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, event_type = 'cultural', venue, schedule_date = '2026-02-26', start_time, end_time, event_id } = req.body;
  if (!title) { res.status(400).json({ error: 'Title is required' }); return; }
  try {
    const db = getSqlite();
    const id = `sch-${Date.now()}`;
    db.prepare(`
      INSERT INTO schedule_items (id, title, description, event_type, venue, schedule_date, start_time, end_time, event_id, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(id, title, description || null, event_type, venue || null, schedule_date, start_time || null, end_time || null, event_id || null, new Date().toISOString());

    const item = db.prepare('SELECT * FROM schedule_items WHERE id = ?').get(id);
    res.status(201).json({ item });
  } catch (error) {
    console.error('Admin create schedule error:', error);
    res.status(500).json({ error: 'Failed to create schedule item' });
  }
});

router.patch('/schedule/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const db = getSqlite();
    const existing = db.prepare('SELECT * FROM schedule_items WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Schedule item not found' }); return; }

    const { title, description, event_type, venue, schedule_date, start_time, end_time, event_id } = req.body;
    db.prepare(`
      UPDATE schedule_items SET
        title = ?,
        description = ?,
        event_type = ?,
        venue = ?,
        schedule_date = ?,
        start_time = ?,
        end_time = ?,
        event_id = ?
      WHERE id = ?
    `).run(
      title ?? existing.title,
      description ?? existing.description,
      event_type ?? existing.event_type,
      venue ?? existing.venue,
      schedule_date ?? existing.schedule_date,
      start_time ?? existing.start_time,
      end_time ?? existing.end_time,
      event_id ?? existing.event_id,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM schedule_items WHERE id = ?').get(req.params.id);
    res.json({ item: updated });
  } catch (error) {
    console.error('Admin update schedule error:', error);
    res.status(500).json({ error: 'Failed to update schedule item' });
  }
});

router.delete('/schedule/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const db = getSqlite();
    db.prepare('DELETE FROM schedule_items WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Admin delete schedule error:', error);
    res.status(500).json({ error: 'Failed to delete schedule item' });
  }
});

// ── Results Management (Enhanced Category, Event, Position & Winner) ──
router.get('/results', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const db = getSqlite();
    const rows = db.prepare('SELECT * FROM results ORDER BY rowid DESC').all();
    res.json({ results: rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

router.post('/results', async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    category, event_id, event_name, position = '1st Place / Winner',
    winner_name, winner_college, description,
    first_place_team, first_place_college, second_place_team, second_place_college,
    second_place_description, third_place_team, third_place_college, third_place_description
  } = req.body;

  if (!event_name || (!winner_name && !first_place_team)) {
    res.status(400).json({ error: 'event_name and winner details are required' });
    return;
  }

  try {
    const db = getSqlite();
    const id = `res-${Date.now()}`;
    const primaryWinner = winner_name || first_place_team;
    const primaryCollege = winner_college || first_place_college;

    db.prepare(`
      INSERT INTO results
        (id, category, event_id, event_name, position, winner_name, winner_college,
         description, first_place_team, first_place_college, second_place_team,
         second_place_college, second_place_description, third_place_team, third_place_college,
         third_place_description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, category || 'General', event_id || null, event_name, position,
      primaryWinner, primaryCollege || null, description || null,
      primaryWinner, primaryCollege || null, second_place_team || null,
      second_place_college || null, second_place_description || null,
      third_place_team || null, third_place_college || null,
      third_place_description || null, new Date().toISOString()
    );

    const created = db.prepare('SELECT * FROM results WHERE id = ?').get(id);
    res.status(201).json({ result: created });
  } catch (error) {
    console.error('Admin create result error:', error);
    res.status(500).json({ error: 'Failed to create result' });
  }
});

router.patch('/results/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const db = getSqlite();
    const existing = db.prepare('SELECT * FROM results WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }

    const {
      category, event_name, position, winner_name, winner_college, description,
      first_place_team, first_place_college, second_place_team, second_place_college,
      second_place_description, third_place_team, third_place_college, third_place_description
    } = req.body;

    db.prepare(`
      UPDATE results SET
        category = ?,
        event_name = ?,
        position = ?,
        winner_name = ?,
        winner_college = ?,
        description = ?,
        first_place_team = ?,
        first_place_college = ?,
        second_place_team = ?,
        second_place_college = ?,
        second_place_description = ?,
        third_place_team = ?,
        third_place_college = ?,
        third_place_description = ?
      WHERE id = ?
    `).run(
      category ?? existing.category,
      event_name ?? existing.event_name,
      position ?? existing.position,
      winner_name ?? existing.winner_name,
      winner_college ?? existing.winner_college,
      description ?? existing.description,
      first_place_team ?? existing.first_place_team,
      first_place_college ?? existing.first_place_college,
      second_place_team ?? existing.second_place_team,
      second_place_college ?? existing.second_place_college,
      second_place_description ?? existing.second_place_description,
      third_place_team ?? existing.third_place_team,
      third_place_college ?? existing.third_place_college,
      third_place_description ?? existing.third_place_description,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM results WHERE id = ?').get(req.params.id);
    res.json({ result: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update result' });
  }
});

router.delete('/results/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const db = getSqlite();
    db.prepare('DELETE FROM results WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete result' });
  }
});

// ── Gallery Management ────────────────────────────────────────────
router.get('/gallery', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT * FROM gallery ORDER BY created_at DESC', []);
    res.json({ gallery: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

router.post('/gallery', async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, caption, image_url, category = 'General', year = '2026' } = req.body;
  if (!title || !image_url) { res.status(400).json({ error: 'title and image_url required' }); return; }
  try {
    const result = await query(
      'INSERT INTO gallery (title, caption, image_url, category, year, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, caption || null, image_url, category, year, new Date().toISOString()]
    );
    res.status(201).json({ item: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add gallery item' });
  }
});

router.patch('/gallery/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const db = getSqlite();
    const existing = db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
    const { title, caption, category } = req.body;
    db.prepare('UPDATE gallery SET title = ?, caption = ?, category = ? WHERE id = ?')
      .run(title ?? existing.title, caption ?? existing.caption, category ?? existing.category, req.params.id);
    const updated = db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
    res.json({ item: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update gallery item' });
  }
});

router.delete('/gallery/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await query('DELETE FROM gallery WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete gallery item' });
  }
});

// ── Sponsors Management ───────────────────────────────────────────
router.get('/sponsors', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT * FROM sponsors', []);
    res.json({ sponsors: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sponsors' });
  }
});

router.post('/sponsors', async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, logo_url, website_url, tier = 'associate', description } = req.body;
  if (!name) { res.status(400).json({ error: 'name required' }); return; }
  try {
    const result = await query(
      'INSERT INTO sponsors (name, logo_url, website_url, tier, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, logo_url || null, website_url || null, tier, description || null]
    );
    res.status(201).json({ sponsor: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add sponsor' });
  }
});

router.patch('/sponsors/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const db = getSqlite();
    const existing = db.prepare('SELECT * FROM sponsors WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
    const { name, logo_url, website_url, tier, description } = req.body;
    db.prepare('UPDATE sponsors SET name = ?, logo_url = ?, website_url = ?, tier = ?, description = ? WHERE id = ?')
      .run(name ?? existing.name, logo_url ?? existing.logo_url, website_url ?? existing.website_url, tier ?? existing.tier, description ?? existing.description, req.params.id);
    const updated = db.prepare('SELECT * FROM sponsors WHERE id = ?').get(req.params.id);
    res.json({ sponsor: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update sponsor' });
  }
});

router.delete('/sponsors/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await query('DELETE FROM sponsors WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete sponsor' });
  }
});

// ── Contact (static) ──────────────────────────────────────────────
router.get('/contact', async (_req: AuthRequest, res: Response): Promise<void> => {
  res.json({ contact: { email: 'colorido2k26@rvrjc.edu', phone: '+91 86322 88254', address: 'RVR & JC College of Engineering, Chandramoulipuram, Chowdavaram, Guntur - 522019, Andhra Pradesh' } });
});

// ── Site Config (fallback) ────────────────────────────────────────
router.get('/config', async (_req: AuthRequest, res: Response): Promise<void> => {
  res.json({ config: [] });
});

function tryParseJson(val: any): any {
  if (!val || typeof val !== 'string') return val ?? [];
  try { return JSON.parse(val); } catch { return []; }
}

export default router;
