import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('ENV URL:', supabaseUrl);
console.log('ENV KEY EXISTS:', !!supabaseAnonKey);

let supabase: any = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(
    supabaseUrl,
    supabaseAnonKey
  );
  console.log('✅ Frontend Supabase connected');
} else {
  console.error('❌ Missing Vite Supabase env variables');
}

export { supabase };