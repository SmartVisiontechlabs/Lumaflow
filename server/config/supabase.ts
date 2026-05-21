import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl);
console.log('KEY EXISTS:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase env variables missing');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    global: {
      fetch,
    },
    realtime: {
      transport: ws as any,
    },
  }
);

export const getSupabaseClient = (req?: any) => {
  const authHeader = req?.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    return createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          fetch,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        realtime: {
          transport: ws as any,
        },
      }
    );
  }
  return supabase;
};

console.log('✅ Supabase connected');