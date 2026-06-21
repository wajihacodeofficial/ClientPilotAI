import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import leadsRouter from './routes/leads';
import analyticsRouter from './routes/analytics';
import adminRouter from './routes/admin';
import proposalsRouter from './routes/proposals';
import aiRouter from './routes/ai';
import { authMiddleware, adminMiddleware } from './middleware/auth';
import { supabaseAdmin } from './lib/supabase';


dotenv.config();

export const app = express();

app.set('trust proxy', 1);

// CORS: allow local dev + Vercel production frontend
// Set FRONTEND_URL env var on Railway to your Vercel app URL e.g. https://clientpilotai.vercel.app
const allowedOrigins = [
  'http://localhost:5173',
  'http://192.168.1.4:5173',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

const isAllowedOrigin = (origin: string): boolean => {
  if (allowedOrigins.includes(origin)) return true;
  // Allow local development patterns
  if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return true;
  if (/^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return true;
  if (/^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin)) return true;
  // Allow Vercel deployments (production, preview, and branch builds)
  if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return true;
  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
}));
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

// Public AI diagnostics (no auth — test Gemini independently)
app.use('/api/ai', aiRouter);

// Protected API Routes
app.use('/api/leads', authMiddleware, leadsRouter);
app.use('/api/proposals', authMiddleware, proposalsRouter);
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
