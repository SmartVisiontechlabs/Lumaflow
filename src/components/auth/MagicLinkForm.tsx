import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MagicLinkForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';
      const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

      console.log('[MagicLinkForm] Requesting magic link redirection via backend API:', `${API_URL}/auth/magic-link`);
      
      const response = await fetch(`${API_URL}/auth/magic-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'The path to the sanctuary could not be opened. Please verify your email.');
      }

      // Save email and first name to sessionStorage for display on the /check-email page
      sessionStorage.setItem('auth_email_attempt', email.trim());
      if (data.firstName) {
        sessionStorage.setItem('auth_first_name', data.firstName);
      } else {
        sessionStorage.removeItem('auth_first_name');
      }
      navigate('/check-email');
    } catch (err: any) {
      console.error('[MagicLinkForm] Error:', err);
      setError(err.message || 'The path to the sanctuary could not be opened. Please verify your email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
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
          className="text-[11px] font-medium tracking-[0.05em] text-red-500/80 text-center italic"
        >
          “{error}”
        </motion.p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-5 bg-text-dark text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] shadow-luxury hover:bg-[#CBAE73] hover:text-black hover:scale-[1.02] active:scale-[0.98] transition-all duration-700 group relative overflow-hidden disabled:opacity-50 cursor-pointer"
      >
        <div className="relative z-10 flex items-center justify-center gap-3">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <>
              Continue Your Journey
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-500" />
            </>
          )}
        </div>
      </button>
    </form>
  );
}
