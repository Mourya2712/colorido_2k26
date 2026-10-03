import { Router, Request, Response } from 'express';
import { query } from '../database/db';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { category, ticker_only } = req.query;
  try {
    let sql = 'SELECT * FROM announcements WHERE is_published = true';
    const params: unknown[] = [];
    let idx = 1;
    if (category && category !== 'all') {
      sql += ` AND category = $${idx++}`;
      params.push(category);
    }
    if (ticker_only === 'true') {
      sql += ` AND is_ticker = true`;
    }
    sql += ' ORDER BY created_at DESC LIMIT 50';
    const result = await query(sql, params);
    // Derive is_urgent from priority for frontend compatibility
    const announcements = result.rows.map((row: any) => ({
      ...row,
      is_urgent: row.priority === 'urgent' || Boolean(row.is_urgent),
    }));
    res.json({ announcements });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

export default router;
