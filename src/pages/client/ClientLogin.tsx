import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Sparkles, ArrowRight, Compass } from 'lucide-react';

const ClientLogin = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const navigate = useNavigate();

  // Check if they are already logged in
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/client/dashboard');
      }
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const redirectTo = `${window.location.origin}/client/dashboard`;
      console.log('[ClientLogin] Requesting magic link redirection to:', redirectTo);
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectTo,
        },
      });

      if (error) throw error;
      setIsSent(true);
    } catch (err: any) {
      console.error('[ClientLogin] Error:', err);
      setError(err.message || 'The path to the sanctuary could not be opened.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6 relative overflow-hidden font-body selection:bg-gold/10 selection:text-gold">
      {/* Background Glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[80%] bg-gold/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[70%] bg-gold/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-grain" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[460px] bg-white/40 backdrop-blur-3xl border border-white/60 p-12 sm:p-14 rounded-[3rem] shadow-luxury relative z-10"
      >
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-text-dark rounded-full flex items-center justify-center mx-auto mb-8 shadow-button relative group hover:scale-105 transition-transform duration-700">
            <Compass className="w-6 h-6 text-gold animate-breathe" />
            <div className="absolute inset-0 rounded-full border border-gold/20 scale-125 opacity-0 group-hover:opacity-100 transition-all duration-1000" />
          </div>
          <h1 className="text-3xl font-display tracking-tight text-text-dark mb-4">Your Sanctuary</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">Client Portal Entry</p>
        </div>

        <AnimatePresence mode="wait">
          {!isSent ? (
            <motion.form 
              key="login-form"
              onSubmit={handleLogin} 
              className="space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="space-y-3">
                <p className="text-xs text-text-dark/60 text-center leading-relaxed mb-4">
                  Enter your email address below. We will send a magic link to instantly sign you into your personal client sanctuary.
                </p>
                
                <div className="group relative">
                  <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-text-dark/20 group-focus-within:text-gold transition-colors duration-500" />
                  </div>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/50 border border-text-dark/5 py-5 pl-14 pr-6 rounded-2xl text-sm focus:outline-none focus:border-gold/30 focus:bg-white transition-all duration-700 placeholder:text-text-dark/20 text-text-dark"
                  />
                </div>
              </div>

              {error && (
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[10px] font-bold uppercase tracking-[0.1em] text-red-400 text-center italic"
                >
                  “{error}”
                </motion.p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-text-dark text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.5em] shadow-button hover:bg-gold transition-all duration-700 group relative overflow-hidden disabled:opacity-50"
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Request Access Link
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </motion.form>
          ) : (
            <motion.div 
              key="sent-state"
              className="text-center space-y-8 py-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Sparkles className="w-5 h-5 text-gold" />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-display text-text-dark">A Pathway Awaits</h3>
                <p className="text-xs text-text-dark/60 leading-relaxed max-w-sm mx-auto">
                  A magic access link has been dispatched to <span className="font-bold text-text-dark">{email}</span>. Click the link in your email to step instantly into your sanctuary dashboard.
                </p>
              </div>
              <div className="pt-6 border-t border-text-dark/5">
                <button
                  onClick={() => setIsSent(false)}
                  className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold hover:text-text-dark transition-colors duration-500"
                >
                  Change Email Address
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 pt-8 border-t border-text-dark/5 text-center">
          <p className="text-[9px] font-medium tracking-[0.2em] text-text-dark/20 uppercase">
            Secure Passwordless Auth
          </p>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-12 left-0 right-0 text-center pointer-events-none">
        <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-text-dark/10">Lumaflow Sanctuary</p>
      </div>
    </div>
  );
};

export default ClientLogin;
