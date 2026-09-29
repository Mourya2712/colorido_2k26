import { Router, Request, Response } from 'express';
import { query } from '../database/db';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { category, ticker_only } = req.query;
  try {
    let sql = 'SELECT * FROM announcements WHERE 1=1';
    const params: unknown[] = [];
    let idx = 1;
    if (category && category !== 'all') {
      sql += ` AND category = $${idx++}`;
      params.push(category);
    }
    if (ticker_only === 'true') {
      sql += ` AND (is_ticker = 1 OR is_ticker = true)`;
    }
    sql += ' ORDER BY created_at DESC LIMIT 50';
    const result = await query(sql, params);
    res.json({ announcements: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

export default router;
