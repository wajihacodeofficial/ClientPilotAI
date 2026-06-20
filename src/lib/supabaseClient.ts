import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not set. ' +
    'Please configure them in your local .env file.'
  );
}

// Initialize client with fallback values to prevent build/init time crashes
export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321',
  (supabaseAnonKey || 'placeholder-anon-key').trim()
);

/**
 * Uploads a file to a Supabase Storage bucket and returns its public URL.
 * 
 * @param bucket Storage bucket name (e.g. 'avatars')
 * @param path Destination path inside the bucket (e.g. 'user123/avatar.png')
 * @param file The file to upload
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(bucket: string, path: string, file: File): Promise<string> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrl;
}
