import { Request, Response, NextFunction } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';

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
