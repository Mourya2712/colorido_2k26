import { Router, Request, Response } from 'express';
import { query } from '../database/db';

const router = Router();

// Public: GET /api/config
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT key, value FROM site_config');
    const config: Record<string, string> = {};
    result.rows.forEach((r) => { config[r.key] = r.value; });
    res.json({
      config,
      festival_dates: config['festival_dates'] || '[OFFICIAL DATE TO BE UPDATED]',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch site config' });
  }
});

// Public: GET /api/config/dates
router.get('/dates', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query("SELECT value FROM site_config WHERE key = 'festival_dates'");
    const festival_dates = result.rows[0]?.value || '[OFFICIAL DATE TO BE UPDATED]';
    res.json({ festival_dates });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch festival dates' });
  }
});

export default router;
