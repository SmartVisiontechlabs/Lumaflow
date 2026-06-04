import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', supabaseUrl);
console.log('KEY EXISTS:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ Supabase env variables missing');
}

/**
 * PUBLIC CLIENT
 * Used for normal app access
 */
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    realtime: {
      transport: ws as any,
    },
    global: {
      fetch,
    },
  }
);

/**
 * ADMIN CLIENT
 * Used for secure backend operations:
 * - magic links
 * - user creation
 * - membership sync
 * - admin booking management
 */
export const supabaseAdmin = supabaseServiceRoleKey
  ? (() => {
    console.log(
      '🔑 Supabase service role key found. Initializing supabaseAdmin...'
    );

    return createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        realtime: {
          transport: ws as any,
        },
        global: {
          fetch,
        },
      }
    );
  })()
  : (() => {
    console.warn(
      '⚠️ Supabase service role key missing. Programmatic user creation and magic links will fallback.'
    );

    return null;
  })();

/**
 * REQUEST CLIENT
 * Uses frontend JWT token if available
 */
export const getSupabaseClient = (req?: any) => {
  const authHeader =
    req?.headers?.authorization;

  if (
    authHeader &&
    authHeader.startsWith('Bearer ')
  ) {
    const token = authHeader.split(' ')[1];

    return createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          fetch,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );
  }

  return supabase;
};

console.log('✅ Supabase connected');