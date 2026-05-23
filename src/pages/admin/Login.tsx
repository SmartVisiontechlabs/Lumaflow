import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminSupabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'The sanctuary could not be accessed at this time.');
      }

      const { session } = result;
      const { error: sessionErr } = await adminSupabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      });

      if (sessionErr) throw sessionErr;

      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'The sanctuary could not be accessed at this time.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Accents */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] bg-gold/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[50%] bg-gold/5 blur-[100px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[440px] bg-white/40 backdrop-blur-3xl border border-white/60 p-12 rounded-[3rem] shadow-luxury relative z-10"
      >
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-text-dark rounded-full flex items-center justify-center mx-auto mb-8 shadow-button">
            <Lock className="w-6 h-6 text-gold" />
          </div>
          <h1 className="text-3xl font-display tracking-tight text-text-dark mb-4">Sanctuary Portal</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold/60">Administrative Entry</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-6">
            <div className="group relative">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Mail className="w-4 h-4 text-text-dark/20 group-focus-within:text-gold transition-colors duration-500" />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/50 border border-text-dark/5 py-5 pl-14 pr-6 rounded-2xl text-sm focus:outline-none focus:border-gold/30 focus:bg-white transition-all duration-700 placeholder:text-text-dark/20"
              />
            </div>

            <div className="group relative">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-text-dark/20 group-focus-within:text-gold transition-colors duration-500" />
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/50 border border-text-dark/5 py-5 pl-14 pr-6 rounded-2xl text-sm focus:outline-none focus:border-gold/30 focus:bg-white transition-all duration-700 placeholder:text-text-dark/20"
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
            className="w-full py-6 bg-text-dark text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.5em] shadow-button hover:bg-gold transition-all duration-700 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="relative z-10 flex items-center justify-center gap-3">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Enter Sanctuary
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </div>
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-text-dark/5 text-center">
          <p className="text-[9px] font-medium tracking-[0.2em] text-text-dark/20 uppercase">
            Authorized Personnel Only
          </p>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-12 left-0 right-0 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-text-dark/10">Lumaflow Sanctuary Operations</p>
      </div>
    </div>
  );
};

export default Login;
