import { supabaseAdmin } from '../lib/supabase';

const token = "eyJhbGciOiJFUzI1NiIsImtpZCI6ImI0ZDQ2NDUwLWM0ZmMtNGM2Yy1hOGFkLTVjMGJmYWRhNDYxZCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2ptcmhmZ2FjbWVpb3hzanp1dmZjLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI0YWE1YTg0OS1hYWIyLTQwMjYtYWU0Mi0yYTYzM2EwZGVhOGEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzgxOTU2NzI3LCJpYXQiOjE3ODE5NTMxMjcsImVtYWlsIjoiYWRtaW5AY2xpZW50cGlsb3RhaS5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJTeXN0ZW0gQWRtaW4ifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc4MTk1MzEyN31dLCJzZXNzaW9uX2lkIjoiNzE3YTMyOGEtMjZkYi00YzQyLWJjMGUtNDA5MGZiMGNiZjkzIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.Pcf29QK7DRjPLWotHYrfzrTy8Bk7PaDyzNYE29tdl8GG3dOeJPJNsSCKCkMmGzPqwu_f3RXTazh8FiOGX4emiQ";

async function run() {
  console.log('Testing direct HTTP fetch to GoTrue /user endpoint...');
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl) {
    console.error('SUPABASE_URL not configured');
    return;
  }
  
  try {
    const url = `${supabaseUrl}/auth/v1/user`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': anonKey || '',
      }
    });
    
    console.log('Response status:', res.status);
    const data = await res.json();
    console.log('Response data:', data);
  } catch (err) {
    console.error('Fetch exception:', err);
  }
}

run();
