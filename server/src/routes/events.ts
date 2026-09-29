import { Router, Request, Response } from 'express';
import { query, getSqlite } from '../database/db';

const router = Router();

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

// GET /api/events/popular — Top 3 most registered Cultural events
router.get('/popular', async (_req: Request, res: Response): Promise<void> => {
  try {
    if (process.env.DATABASE_URL) {
      try {
        const rows = await query(`
          SELECT e.*, COUNT(r.id) as reg_count
          FROM events e
          LEFT JOIN registrations r ON (r.event_id = e.id::text OR r.event_id = e.slug) AND r.status != 'cancelled'
          WHERE e.type = 'cultural' AND e.is_active = TRUE
          GROUP BY e.id
          ORDER BY reg_count DESC, e.name ASC
          LIMIT 3
        `);
        const processed = rows.rows.map((ev: any) => ({
          ...ev,
          rules: parseRules(ev.rules),
          reg_count: Number(ev.reg_count || 0),
        }));
        res.json({ events: processed });
        return;
      } catch (pgErr) {
        console.warn('Postgres popular events query error:', pgErr);
      }
    }

    const db = getSqlite();
    if (db) {
      const rows = db.prepare(`
        SELECT e.*, COUNT(r.id) as reg_count
        FROM events e
        LEFT JOIN registrations r ON (r.event_id = e.id OR r.event_id = e.slug) AND r.status != 'cancelled'
        WHERE e.type = 'cultural' AND e.is_active = 1
        GROUP BY e.id
        ORDER BY reg_count DESC, e.name ASC
        LIMIT 3
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
    console.error('Popular events error:', error);
    res.status(500).json({ error: 'Failed to fetch popular events' });
  }
});

// GET /api/events — Public: get all active events (with optional filters)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { type, gender, category_id, slug, search } = req.query;

  try {
    if (process.env.DATABASE_URL) {
      try {
        let sql = `
          SELECT e.*, COUNT(r.id) as reg_count
          FROM events e
          LEFT JOIN registrations r ON (r.event_id = e.id::text OR r.event_id = e.slug) AND r.status != 'cancelled'
          WHERE e.is_active = TRUE
        `;
        const params: any[] = [];
        let idx = 1;

        if (type) {
          if (type === 'sports_boys') {
            sql += ` AND (e.type = 'sports_boys' OR (e.type = 'sports' AND e.gender = 'boys'))`;
          } else if (type === 'sports_girls') {
            sql += ` AND (e.type = 'sports_girls' OR (e.type = 'sports' AND e.gender = 'girls'))`;
          } else if (type === 'sports') {
            sql += ` AND (e.type IN ('sports', 'sports_boys', 'sports_girls'))`;
          } else {
            sql += ` AND e.type = $${idx++}`;
            params.push(type);
          }
        }
        if (gender && gender !== 'all') {
          sql += ` AND (e.gender = $${idx++} OR e.gender = 'all')`;
          params.push(gender);
        }
        if (category_id) {
          sql += ` AND (e.category_id::text = $${idx++} OR e.category_name ILIKE $${idx++})`;
          params.push(category_id, `%${category_id}%`);
        }
        if (slug) {
          sql += ` AND (e.slug = $${idx++} OR e.id::text = $${idx++})`;
          params.push(slug, slug);
        }
        if (search) {
          sql += ` AND (e.name ILIKE $${idx++} OR e.short_description ILIKE $${idx++} OR e.category_name ILIKE $${idx++})`;
          const s = `%${search}%`;
          params.push(s, s, s);
        }

        sql += ` GROUP BY e.id ORDER BY e.category_name ASC, e.name ASC`;

        const result = await query(sql, params);
        const processed = result.rows.map((ev: any) => ({
          ...ev,
          rules: parseRules(ev.rules),
          reg_count: Number(ev.reg_count || 0),
        }));
        res.json({ events: processed, total: processed.length });
        return;
      } catch (pgErr) {
        console.warn('Postgres public events query error:', pgErr);
      }
    }

    const db = getSqlite();
    if (db) {
      let sql = `
        SELECT e.*, COUNT(r.id) as reg_count
        FROM events e
        LEFT JOIN registrations r ON (r.event_id = e.id OR r.event_id = e.slug) AND r.status != 'cancelled'
        WHERE e.is_active = 1
      `;
      const params: any[] = [];

      if (type) {
        if (type === 'sports_boys') {
          sql += ` AND (e.type = 'sports_boys' OR (e.type = 'sports' AND e.gender = 'boys'))`;
        } else if (type === 'sports_girls') {
          sql += ` AND (e.type = 'sports_girls' OR (e.type = 'sports' AND e.gender = 'girls'))`;
        } else if (type === 'sports') {
          sql += ` AND (e.type IN ('sports', 'sports_boys', 'sports_girls'))`;
        } else {
          sql += ` AND e.type = ?`;
          params.push(type);
        }
      }
      if (gender && gender !== 'all') {
        sql += ` AND (e.gender = ? OR e.gender = 'all')`;
        params.push(gender);
      }
      if (category_id) {
        sql += ` AND (e.category_id = ? OR e.category_name LIKE ?)`;
        params.push(category_id, `%${category_id}%`);
      }
      if (slug) {
        sql += ` AND (e.slug = ? OR e.id = ?)`;
        params.push(slug, slug);
      }
      if (search) {
        sql += ` AND (e.name LIKE ? OR e.short_description LIKE ? OR e.category_name LIKE ?)`;
        const s = `%${search}%`;
        params.push(s, s, s);
      }

      sql += ` GROUP BY e.id ORDER BY e.category_name ASC, e.name ASC`;

      const rows = db.prepare(sql).all(...params) as any[];
      const processed = rows.map((ev: any) => ({
        ...ev,
        rules: parseRules(ev.rules),
        reg_count: Number(ev.reg_count || 0),
      }));

      res.json({ events: processed, total: processed.length });
      return;
    }

    res.json({ events: [], total: 0 });
  } catch (error) {
    console.error('Events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /api/events/:idOrSlug — Public: get single event
router.get('/:idOrSlug', async (req: Request, res: Response): Promise<void> => {
  const { idOrSlug } = req.params;
  try {
    if (process.env.DATABASE_URL) {
      try {
        const result = await query(`
          SELECT e.*, COUNT(r.id) as reg_count
          FROM events e
          LEFT JOIN registrations r ON (r.event_id = e.id::text OR r.event_id = e.slug) AND r.status != 'cancelled'
          WHERE (e.id::text = $1 OR e.slug = $2) AND e.is_active = TRUE
          GROUP BY e.id
        `, [idOrSlug, idOrSlug]);

        if (result.rows.length) {
          const row = result.rows[0];
          row.rules = parseRules(row.rules);
          row.reg_count = Number(row.reg_count || 0);
          res.json({ event: row });
          return;
        }
      } catch (pgErr) {
        console.warn('Postgres single event query error:', pgErr);
      }
    }

    const db = getSqlite();
    if (db) {
      const row = db.prepare(`
        SELECT e.*, COUNT(r.id) as reg_count
        FROM events e
        LEFT JOIN registrations r ON (r.event_id = e.id OR r.event_id = e.slug) AND r.status != 'cancelled'
        WHERE (e.id = ? OR e.slug = ?) AND e.is_active = 1
        GROUP BY e.id
      `).get(idOrSlug, idOrSlug) as any;

      if (row) {
        row.rules = parseRules(row.rules);
        row.reg_count = Number(row.reg_count || 0);
        res.json({ event: row });
        return;
      }
    }

    res.status(404).json({ error: 'Event not found' });
  } catch (error) {
    console.error('Event fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

export default router;
