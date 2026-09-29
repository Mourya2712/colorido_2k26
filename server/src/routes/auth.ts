import { Router, Request, Response } from 'express';
import { query } from '../database/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

const router = Router();

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
], async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: 'Invalid credentials format' });
    return;
  }

  const { email, password } = req.body;

  try {
    const result = await query(
      'SELECT * FROM admins WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const admin = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);

    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'colorido2k26_dev_jwt_secret_key';
    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
      secret,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/verify
router.post('/verify', async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;
  if (!token) { res.status(400).json({ valid: false }); return; }

  try {
    const secret = process.env.JWT_SECRET || 'colorido2k26_dev_jwt_secret_key';
    const payload = jwt.verify(token, secret);
    res.json({ valid: true, payload });
  } catch {
    res.status(401).json({ valid: false });
  }
});

export default router;
