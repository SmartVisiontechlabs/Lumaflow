import { supabase, supabaseAdmin } from '../config/supabase';

export const authService = {
  /**
   * Checks if user has an account. If not, auto-creates their authentication user
   * and inserts their profile record.
   */
  async provisionUserAccount(email: string, fullName: string): Promise<{ userId: string | null; isNew: boolean; actionLink?: string }> {
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
        
        // Generate secure silent reauthentication link using Supabase Admin
        let actionLink: string | undefined;
        if (supabaseAdmin) {
          try {
            const redirectTo = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/client/dashboard`;
            console.log(`[authService] Generating silent reauth link for existing user: ${email}`);
            const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
              type: 'magiclink',
              email,
              options: {
                redirectTo
              }
            });
            if (linkErr) {
              console.error('[authService] Error generating silent reauth link:', linkErr);
            } else if (linkData?.properties?.action_link) {
              actionLink = linkData.properties.action_link;
              console.log('[authService] Silent reauth link generated successfully');
            }
          } catch (e) {
            console.error('[authService] Exception generating silent reauth link:', e);
          }
        }
        
        return { userId, isNew: false, actionLink };
      }

      const redirectTo = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/client/dashboard`;
      let newUserId: string | null = null;
      let actionLink: string | undefined;

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
          console.log(`[authService] Programmatically created user successfully. ID: ${newUserId}`);

          // Programmatically generate reauth action link for this new user so they can auto login
          try {
            console.log(`[authService] Generating silent auto-login action link for new user: ${email}`);
            const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
              type: 'magiclink',
              email,
              options: {
                redirectTo
              }
            });
            if (linkErr) {
              console.error('[authService] Error generating action link for new user:', linkErr);
            } else if (linkData?.properties?.action_link) {
              actionLink = linkData.properties.action_link;
              console.log('[authService] Auto-login action link generated successfully for new user');
            }
          } catch (e) {
            console.error('[authService] Exception generating action link for new user:', e);
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
          console.error('[authService] Error triggering OTP during provisioning:', otpError);
        }

        // Poll RPC to wait for trigger on_auth_user_created to run and create profiles
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
      }

      return { userId: newUserId, isNew: true, actionLink };
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

