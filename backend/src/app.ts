import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import leadsRouter from './routes/leads';
import analyticsRouter from './routes/analytics';
import adminRouter from './routes/admin';
import { authMiddleware, adminMiddleware } from './middleware/auth';
import { supabaseAdmin } from './lib/supabase';

dotenv.config();

export const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Protected API Routes
app.use('/api/leads', authMiddleware, leadsRouter);
app.use('/api/analytics', authMiddleware, analyticsRouter);
app.use('/api/admin', authMiddleware, adminMiddleware, adminRouter);

// Error handling middleware
app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  void req;
  void _next;
  console.error(err instanceof Error ? err.stack : err);
  const status = (err && typeof err === 'object' && 'status' in err && typeof err.status === 'number') ? err.status : 500;
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  res.status(status).json({
    error: message,
  });
});

export const verifySupabaseConnection = async () => {
  try {
    const { error } = await supabaseAdmin.from('profiles').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('[Supabase] Database connection check failed:', error.message);
    } else {
      console.log('[Supabase] Database connection check successful! Connectivity is working.');
    }
  } catch (err: unknown) {
    console.error('[Supabase] Database connection check threw an exception:', err instanceof Error ? err.message : String(err));
  }
};
