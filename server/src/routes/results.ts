import { Router, Request, Response } from 'express';
import { getSqlite } from '../database/db';

const router = Router();

// GET /api/results — Public results with category, event name, position, and winner
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { category } = req.query;
  try {
    const db = getSqlite();
    let sql = 'SELECT * FROM results WHERE 1=1';
    const params: any[] = [];

    if (category && category !== 'all') {
      sql += ' AND (LOWER(category) LIKE ? OR LOWER(event_name) LIKE ?)';
      const c = `%${String(category).toLowerCase()}%`;
      params.push(c, c);
    }

    sql += ' ORDER BY rowid DESC';
    const rows = db.prepare(sql).all(...params);
    res.json({ results: rows });
  } catch (error) {
    console.error('Results error:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

export default router;
