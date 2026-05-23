import { supabase, supabaseAdmin } from '../config/supabase';

export const authService = {
  /**
   * Checks if user has an account. If not, auto-creates their authentication user
   * and inserts their profile record.
   */
  async provisionUserAccount(email: string, fullName: string): Promise<{ userId: string | null; isNew: boolean }> {
    try {
      console.log(`[authService] Checking account status for: ${email}`);

      // 1. Check if profile already exists using SECURITY DEFINER RPC
      const { data: userId, error: rpcErr } = await supabase.rpc('get_user_id_by_email', {
        email_to_check: email
      });

      if (rpcErr) {
        console.error('[authService] Error checking profiles via RPC:', rpcErr);
      }

      if (userId) {
        console.log(`[authService] Existing user profile found with ID: ${userId}`);
        return { userId, isNew: false };
      }

      // 2. Profile does not exist, trigger auto-creation via signInWithOtp
      console.log(`[authService] User profile not found. Triggering passwordless auth auto-creation for: ${email}`);
      
      const redirectTo = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/client/dashboard`;
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectTo
        }
      });

      if (otpError) {
        console.error('[authService] Error triggering OTP during provisioning:', otpError);
      }

      // 3. Poll RPC to wait for trigger on_auth_user_created to run and create profiles
      let newUserId: string | null = null;
      for (let attempt = 1; attempt <= 10; attempt++) {
        console.log(`[authService] Polling for profile creation (attempt ${attempt}/10)...`);
        const { data: polledId } = await supabase.rpc('get_user_id_by_email', {
          email_to_check: email
        });
        if (polledId) {
          newUserId = polledId;
          console.log(`[authService] Profile successfully detected! ID: ${newUserId}`);
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      if (!newUserId) {
        console.warn(`[authService] Profile creation polling timed out for: ${email}`);
      }

      return { userId: newUserId, isNew: true };
    } catch (err) {
      console.error('[authService] Unexpected error in provisionUserAccount:', err);
      return { userId: null, isNew: false };
    }
  },

  /**
   * Generates a passwordless magic login link for the user (standard OTP fallback)
   */
  async generateMagicLink(email: string): Promise<string | null> {
    try {
      console.log(`[authService] Triggering magic login email for: ${email}`);
      const redirectTo = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/client/dashboard`;
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectTo
        }
      });

      if (error) {
        console.error('[authService] Error triggering magic link OTP:', error);
        return null;
      }

      console.log('[authService] Magic login email triggered successfully.');
      return 'OTP_SENT';
    } catch (err) {
      console.error('[authService] Unexpected error triggering magic link:', err);
      return null;
    }
  }
};

