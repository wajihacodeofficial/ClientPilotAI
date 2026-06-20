import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase';

export interface SupabaseUserPayload {
  sub: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

// Extend Express Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: SupabaseUserPayload;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      console.error('Supabase auth.getUser error:', error?.message || 'No user returned');
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = {
      sub: user.id,
      email: user.email,
      role: user.role,
      user_metadata: user.user_metadata,
    };
    next();
  } catch (error) {
    console.error('Auth middleware exception:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};


export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user || !user.sub) {
      return res.status(401).json({ error: 'Unauthorized: User session missing' });
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.sub)
      .single();

    if (error || !profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admin role required' });
    }

    next();
  } catch (err: unknown) {
    console.error('Admin middleware error:', err instanceof Error ? err.message : String(err));
    res.status(500).json({ error: 'Internal server error during authorization check' });
  }
};
