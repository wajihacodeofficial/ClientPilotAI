import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const jwtSecret = process.env.SUPABASE_JWT_SECRET;

const missingVars: string[] = [];
if (!supabaseUrl) missingVars.push('SUPABASE_URL / VITE_SUPABASE_URL');
if (!supabaseServiceKey) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
if (!jwtSecret) missingVars.push('SUPABASE_JWT_SECRET');

if (missingVars.length > 0) {
  console.warn(
    `[Warning] Missing environment variables in backend: ${missingVars.join(', ')}.\n` +
    'Please configure them in backend/.env for database operations and auth validation to succeed.'
  );
}

// Service role client bypasses RLS for backend admin operations.
// Initialized with fallback values to prevent server boot failure.
export const supabaseAdmin = createClient(
  (supabaseUrl || 'http://localhost:54321').trim(),
  (supabaseServiceKey || 'placeholder-service-key').trim(),
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
