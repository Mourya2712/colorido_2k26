import { Router, Request, Response } from 'express';
import { getSqlite } from '../database/db';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const db = getSqlite();
    const rows = db.prepare('SELECT * FROM event_categories ORDER BY display_order ASC').all();
    res.json({ categories: rows });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
