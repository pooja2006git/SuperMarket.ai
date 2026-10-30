import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://ujxibknmaijlbqnnkdie.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!import.meta.env.VITE_SUPABASE_URL || !supabaseAnonKey) {
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to Frontend/.env and restart the Vite server.'
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || 'missing-anon-key'
);
