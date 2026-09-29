import { Router, Request, Response } from 'express';
import { query, getSqlite } from '../database/db';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { type, date } = req.query;
  try {
    if (process.env.DATABASE_URL) {
      try {
        let pgSql = `
          SELECT si.*, e.name as event_name, e.category_name as category
          FROM schedule_items si
          LEFT JOIN events e ON (e.id::text = si.event_id OR e.slug = si.event_id)
          WHERE si.is_active = TRUE
        `;
        const pgParams: any[] = [];
        let idx = 1;
        if (type && type !== 'all') {
          pgSql += ` AND si.event_type = $${idx++}`;
          pgParams.push(type);
        }
        if (date) {
          pgSql += ` AND si.schedule_date = $${idx++}`;
          pgParams.push(date);
        }
        pgSql += ' ORDER BY si.schedule_date ASC, si.start_time ASC';
        const result = await query(pgSql, pgParams);
        res.json({ schedule: result.rows });
        return;
      } catch (err) {
        console.warn('Schedule PG error:', err);
      }
    }

    const db = getSqlite();
    let sql = `
      SELECT si.*, e.name as event_name, e.category_name as category
      FROM schedule_items si
      LEFT JOIN events e ON (e.id = si.event_id OR e.slug = si.event_id)
      WHERE si.is_active = 1
    `;
    const params: any[] = [];
    if (type && type !== 'all') {
      sql += ' AND si.event_type = ?';
      params.push(type);
    }
    if (date) {
      sql += ' AND si.schedule_date = ?';
      params.push(date);
    }
    sql += ' ORDER BY si.schedule_date ASC, si.start_time ASC';
    const rows = db.prepare(sql).all(...params);
    res.json({ schedule: rows });
  } catch (error) {
    console.error('Schedule fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

export default router;
