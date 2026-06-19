import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.SUPABASE_JWT_SECRET;

  if (!jwtSecret) {
    console.error('SUPABASE_JWT_SECRET is not set in environment variables');
    return res.status(500).json({ error: 'Internal server error (auth config)' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT Verification error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
