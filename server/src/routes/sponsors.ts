import { Router, Request, Response } from 'express';
import { query } from '../database/db';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT id, name, logo_url, website, category, description, display_order FROM sponsors WHERE is_active = true ORDER BY display_order ASC');
    res.json({ sponsors: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sponsors' });
  }
});

export default router;
