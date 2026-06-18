import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const handleAuthCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const next = params.get('next') || '/dashboard';

        console.log('[AuthCallback] Exchanging authorization code:', { code, next });

        if (code) {
          try {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) throw exchangeError;
            console.log('[AuthCallback] Successfully exchanged code for session.');
          } catch (exchangeErr: any) {
            console.warn('[AuthCallback] Code exchange failed, checking for active session:', exchangeErr);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
              throw exchangeErr;
            }
            console.log('[AuthCallback] Active session found despite exchange error. Proceeding.');
          }
          
          // Force auth provider to load profile/membership data
          await refresh();

          // Wait for React state updates in AuthProvider to propagate before navigating
          setTimeout(() => {
            console.log('[AuthCallback] Navigating to:', next);
            navigate(next, { replace: true });
          }, 100);
        } else {
          // If code is not present, we might already have a session due to client-side detection.
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            console.log('[AuthCallback] Session already active. Redirecting to dashboard.');
            await refresh();
            setTimeout(() => {
              navigate(next, { replace: true });
            }, 100);
          } else {
            console.warn('[AuthCallback] No authorization code or active session found in callback url.');
            setErrorMsg('No secure session token was provided. Please return to login.');
          }
        }
      } catch (err: any) {
        console.error('[AuthCallback] Exchange error:', err);
        setErrorMsg(err.message || 'Failed to exchange authorization credentials. Please try signing in again.');
      }
    };

    handleAuthCallback();
  }, [navigate, refresh]);

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white/40 backdrop-blur-3xl border border-red-200/50 p-12 rounded-[3rem] shadow-luxury space-y-6">
          <span className="text-4xl">⚠️</span>
          <h2 className="font-display text-2xl text-text-dark">Access Interrupted</h2>
          <p className="text-xs text-text-dark/60 leading-relaxed">{errorMsg}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-5 bg-text-dark text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] shadow-luxury hover:bg-[#CBAE73] hover:text-black transition-all duration-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D16] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Soft glowing ambient backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#CBAE73]/5 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] animate-pulse delay-75" />
      
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-[#CBAE73]/25 animate-ping opacity-60" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-0 rounded-full border border-transparent border-t-[#CBAE73]/80 border-r-[#CBAE73]/40 animate-spin" style={{ animationDuration: '1.2s' }} />
          <span className="font-serif text-lg text-[#CBAE73] tracking-widest font-extralight">LF</span>
        </div>
        
        <div className="flex flex-col items-center gap-1.5 animate-pulse text-center" style={{ animationDuration: '3s' }}>
          <h2 className="font-serif text-[#CBAE73]/90 tracking-[0.25em] text-sm font-light uppercase">LUMAFLOW</h2>
          <p className="text-[#CBAE73]/60 font-sans text-[10px] tracking-[0.2em] font-light uppercase">Verifying Sacred Credentials...</p>
        </div>
      </div>
    </div>
  );
}
