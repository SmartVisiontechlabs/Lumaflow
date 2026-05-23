import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('ENV URL:', supabaseUrl);
console.log('ENV KEY EXISTS:', !!supabaseAnonKey);

let supabase: any = null;
let adminSupabase: any = null;

if (supabaseUrl && supabaseAnonKey) {
  // Public Client for Client Portal & Bookings
  supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        storageKey: 'lumaflow-client-auth-token',
        persistSession: true,
        autoRefreshToken: true
      }
    }
  );

  // Admin Client for Administrative Portal
  adminSupabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        storageKey: 'lumaflow-admin-auth-token',
        persistSession: true,
        autoRefreshToken: true
      }
    }
  );
  console.log('✅ Frontend Supabase connected');
} else {
  console.error('❌ Missing Vite Supabase env variables');
}

export { supabase, adminSupabase };