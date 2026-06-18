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

      const redirectTo = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`;
      let newUserId: string | null = null;

      if (supabaseAdmin) {
        console.log(`[authService] Programmatically creating user and profile for: ${email}`);
        const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            full_name: fullName
          }
        });

        if (createError) {
          console.error('[authService] Error programmatically creating user:', createError);
        } else if (userData?.user) {
          newUserId = userData.user.id;
          console.log(`[NEW USER CREATED] Programmatically created user successfully. ID: ${newUserId}`);

          // Trigger a native Supabase magic link email to the new user so they can access their dashboard
          try {
            console.log(`[authService] Dispatching native magic link login email to new user: ${email}`);
            const { error: otpError } = await supabase.auth.signInWithOtp({
              email,
              options: {
                shouldCreateUser: false, // already created
                emailRedirectTo: redirectTo
              }
            });
            if (otpError) {
              console.error('[authService] Error dispatching native magic link:', otpError);
            }
          } catch (e) {
            console.error('[authService] Exception dispatching native magic link:', e);
          }
        }
      }

      // Fallback if supabaseAdmin is not available or failed to create user
      if (!newUserId) {
        console.log(`[authService] Supabase Admin fallback. Triggering passwordless auth auto-creation for: ${email}`);
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: redirectTo
          }
        });

        if (otpError) {
          console.error('[authService] Error triggering OTP during provisioning fallback:', otpError);
        }

        // Poll RPC to wait for trigger on_auth_user_created to run and create profiles
        for (let attempt = 1; attempt <= 10; attempt++) {
          console.log(`[authService] Polling for profile creation (attempt ${attempt}/10)...`);
          const { data: polledId } = await supabase.rpc('get_user_id_by_email', {
            email_to_check: email
          });
          if (polledId) {
            newUserId = polledId;
            console.log(`[NEW USER CREATED] Profile successfully detected! ID: ${newUserId}`);
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        if (!newUserId) {
          console.warn(`[authService] Profile creation polling timed out for: ${email}`);
        }
      }

      return { userId: newUserId, isNew: true };
    } catch (err) {
      console.error('[authService] Unexpected error in provisionUserAccount:', err);
      return { userId: null, isNew: false };
    }
  },

  /**
   * Generates a passwordless magic login link programmatically via Admin API (without email delivery)
   */
  async generateAutoLoginLink(email: string, redirectTo: string): Promise<string | null> {
    if (!supabaseAdmin) {
      console.warn('[authService] supabaseAdmin is not available. Cannot generate auto login link.');
      return null;
    }
    try {
      console.log(`[authService] Programmatically generating auto-login action link for: ${email}`);
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
          redirectTo
        }
      });

      if (error) {
        console.error('[authService] Error generating action link:', error);
        return null;
      }

      const actionLink = data.properties?.action_link;
      console.log('[authService] Auto-login action link generated successfully.');
      return actionLink || null;
    } catch (err) {
      console.error('[authService] Unexpected error generating action link:', err);
      return null;
    }
  },

  /**
   * Generates a passwordless magic login link for the user (standard OTP fallback)
   */
  async generateMagicLink(email: string): Promise<string | null> {
    try {
      console.log(`[authService] Triggering magic login email for: ${email}`);
      const redirectTo = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`;
      
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
