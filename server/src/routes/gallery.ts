import { Router, Request, Response } from 'express';
import { query } from '../database/db';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { category } = req.query;
  try {
    let sql = 'SELECT id, title, caption, image_url, category, photographer, created_at FROM gallery WHERE is_published = true';
    const params: unknown[] = [];
    if (category && category !== 'all') { sql += ' AND category = $1'; params.push(category); }
    sql += ' ORDER BY display_order ASC, created_at DESC';
    const result = await query(sql, params);
    res.json({ gallery: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

export default router;
