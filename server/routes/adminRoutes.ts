import { Router } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import { requireSession, adminAuth } from '../middleware/authMiddleware';

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

/**
 * POST /api/admin/clients/:id/credits
 * Atomically increments, decrements, or overwrites client credits in the membership_credits table.
 */
router.post('/clients/:id/credits', requireSession, adminAuth, async (req, res) => {
  const { id } = req.params;
  const { creditsDelta, absoluteCredits } = req.body;

  console.log(`[ADMIN CREDITS UPDATE] Client ID: ${id}, delta: ${creditsDelta}, absolute: ${absoluteCredits}`);

  try {
    const dbClient = supabaseAdmin || supabase;

    // Fetch profile to verify user exists and get email
    const { data: profile, error: profileError } = await dbClient
      .from('user_profiles')
      .select('email')
      .eq('id', id)
      .maybeSingle();

    if (profileError || !profile) {
      console.warn(`[ADMIN CREDITS FAILED] Profile not found for client: ${id}`);
      return res.status(404).json({ error: 'Client profile not found' });
    }

    // Fetch existing credits
    const { data: mc, error: mcError } = await dbClient
      .from('membership_credits')
      .select('*')
      .eq('user_id', id)
      .maybeSingle();

    let total = mc?.total_credits || 0;
    let used = mc?.used_credits || 0;
    let remaining = mc?.remaining_credits || 0;

    if (absoluteCredits !== undefined && absoluteCredits !== null) {
      remaining = Number(absoluteCredits);
      if (remaining < 0) {
        return res.status(400).json({ error: 'Remaining credits cannot be negative' });
      }
      total = remaining + used;
    } else if (creditsDelta !== undefined && creditsDelta !== null) {
      remaining = remaining + Number(creditsDelta);
      if (remaining < 0) {
        return res.status(400).json({ error: 'Remaining credits cannot be negative' });
      }
      total = total + Number(creditsDelta);
      if (total < 0) {
        total = 0;
      }
    } else {
      return res.status(400).json({ error: 'Either creditsDelta or absoluteCredits must be provided' });
    }

    // Upsert the credits
    const { data: updatedMc, error: upsertError } = await dbClient
      .from('membership_credits')
      .upsert({
        user_id: id,
        email: profile.email,
        total_credits: total,
        used_credits: used,
        remaining_credits: remaining,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (upsertError) {
      console.error('[Admin Credits API] Error updating credits:', upsertError);
      return res.status(500).json({ error: 'Failed to update client credits' });
    }

    console.log(`[ADMIN CREDITS SUCCESS] Client: ${id}. Remaining credits now: ${remaining}`);
    return res.status(200).json({
      success: true,
      credits: updatedMc
    });
  } catch (err: any) {
    console.error(`[ADMIN CREDITS FAILED] Client: ${id} - Server error:`, err);
    return res.status(500).json({ error: err.message || 'Server error updating client credits' });
  }
});

import { settingsService } from '../services/settingsService';

router.get('/settings/:key', requireSession, adminAuth, async (req, res) => {
  const { key } = req.params;
  try {
    const data = await settingsService.getSettings(key, {});
    return res.status(200).json({ value: data });
  } catch (err: any) {
    console.error(`[ADMIN GET SETTINGS FAILED] Key: ${key} - Server error:`, err);
    return res.status(500).json({ error: err.message || 'Server error loading settings' });
  }
});

router.put('/settings/:key', requireSession, adminAuth, async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  try {
    const result = await settingsService.saveSettings(key, value);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error(`[ADMIN PUT SETTINGS FAILED] Key: ${key} - Server error:`, err);
    return res.status(500).json({ error: err.message || 'Server error updating settings' });
  }
});

router.post('/change-password', requireSession, adminAuth, async (req, res) => {
  const { newPassword } = req.body;
  
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    const userId = (req as any).user.id;
    console.log(`[ADMIN PASSWORD UPDATE ATTEMPT] User: ${userId}`);

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Supabase Admin client is not initialized' });
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (error) {
      console.error('[Admin Password API] Error updating password:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`[ADMIN PASSWORD UPDATE SUCCESS] User: ${userId}`);
    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    console.error(`[ADMIN PASSWORD UPDATE FAILED] Server error:`, err);
    return res.status(500).json({ error: err.message || 'Server error updating password' });
  }
});

export default router;
