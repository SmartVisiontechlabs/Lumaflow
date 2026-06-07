import { Request, Response, NextFunction } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';

export const requireSession = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.warn('[AUTH FAILED] No authorization header provided');
    return res.status(401).json({ error: 'No authorization header provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    console.log('[AUTH START] Verifying token...');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.warn('[AUTH FAILED] Invalid or expired sanctuary token:', error?.message);
      return res.status(401).json({ error: 'Invalid or expired sanctuary token' });
    }

    // Check user_profiles for active profile & role using the admin client to bypass RLS policies
    const client = supabaseAdmin || supabase;
    const { data: profile, error: profileError } = await client
      .from('user_profiles')
      .select('id, email, full_name, role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile) {
      console.warn(`[AUTH FAILED] Profile not found for user ${user.id} (${user.email}). Error:`, profileError);
      return res.status(401).json({ error: 'Access denied: Profile not found' });
    }

    if (!profile.role) {
      console.warn(`[AUTH FAILED] Role not found for user ${user.id} (${user.email}).`);
      return res.status(401).json({ error: 'Access denied: Role not found' });
    }

    console.log(`[SESSION FOUND] Active session validated for user: ${user.id} (${user.email})`);

    // Attach user and profile to request
    (req as any).user = user;
    (req as any).profile = profile;
    next();
  } catch (error) {
    console.error('[AUTH FAILED] Unexpected auth exception:', error);
    return res.status(401).json({ error: 'Sanctuary authentication failed' });
  }
};

export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired sanctuary token' });
    }

    // Check user_profiles for role = admin using the admin client to bypass RLS policies
    const client = supabaseAdmin || supabase;
    const { data: profile, error: profileError } = await client
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile || profile.role !== 'admin') {
      console.warn(`[adminAuth] Access denied for user ${user.id} (${user.email}). Profile:`, profile, 'Error:', profileError);
      return res.status(403).json({ error: 'Access denied: Administrative privileges required' });
    }

    // Attach user and profile to request
    (req as any).user = user;
    (req as any).profile = profile;
    next();
  } catch (error) {
    console.error('[adminAuth] Unexpected auth exception:', error);
    return res.status(401).json({ error: 'Sanctuary authentication failed' });
  }
};

