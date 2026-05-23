import { Router } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`[ADMIN LOGIN ATTEMPT] Email: ${email}`);

  if (!email || !password) {
    console.log(`[ADMIN LOGIN FAILED] Email: ${email || 'unknown'} - Missing credentials`);
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(`[ADMIN LOGIN FAILED] Email: ${email} - Auth error: ${error.message}`);
      return res.status(401).json({ error: error.message });
    }

    if (!data.user || !data.session) {
      console.log(`[ADMIN LOGIN FAILED] Email: ${email} - Missing user session`);
      return res.status(401).json({ error: 'Authentication failed' });
    }

    // Verify user role is admin
    const { data: profile, error: profErr } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profErr) {
      console.log(`[ADMIN LOGIN FAILED] Email: ${email} - Profile fetch error: ${profErr.message}`);
      // Sign out to clear session from backend client
      await supabase.auth.signOut();
      return res.status(500).json({ error: 'Failed to verify admin status' });
    }

    if (!profile || profile.role !== 'admin') {
      console.log(`[ADMIN LOGIN FAILED] Email: ${email} - Access denied: Role is ${profile?.role || 'none'}`);
      // Sign out to clear session from backend client
      await supabase.auth.signOut();
      return res.status(403).json({ error: 'Access denied: Administrative privileges required' });
    }

    console.log(`[ADMIN LOGIN SUCCESS] Email: ${email}`);
    return res.status(200).json({
      session: data.session,
      profile
    });
  } catch (err: any) {
    console.error(`[ADMIN LOGIN FAILED] Email: ${email} - Server error:`, err);
    return res.status(500).json({ error: err.message || 'Sanctuary authentication server error' });
  }
});

export default router;
