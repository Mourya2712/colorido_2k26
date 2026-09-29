import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  admin?: { id: string; email: string; name: string; role: string };
}

export const authenticateAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'colorido2k26_dev_jwt_secret_key';
  try {
    const payload = jwt.verify(token, secret) as {
      id: string; email: string; name: string; role: string;
    };
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.admin?.role !== 'super_admin') {
    res.status(403).json({ error: 'Super admin access required' });
    return;
  }
  next();
};
