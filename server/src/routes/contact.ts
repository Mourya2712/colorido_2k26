import { Router, Request, Response } from 'express';
import { query } from '../database/db';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const keysToFetch = ['college_name', 'festival_name', 'college_address', 'contact_email',
      'contact_phone', 'instagram_url', 'youtube_url', 'facebook_url'];
    const result = await query(
      'SELECT key, value FROM site_config WHERE key = ANY($1)',
      [keysToFetch]
    );
    const config: Record<string, string> = {};
    result.rows.forEach((row) => { config[row.key] = row.value; });
    res.json({ contact: config });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contact info' });
  }
});

export default router;
