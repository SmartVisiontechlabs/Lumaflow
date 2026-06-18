import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function CheckEmailPage() {
  const navigate = useNavigate();
  const email = sessionStorage.getItem('auth_email_attempt') || 'your email';
  const firstName = sessionStorage.getItem('auth_first_name');

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-gold/10 selection:text-gold">
      {/* Background grain overlay */}
      <div className="absolute inset-0 bg-grain pointer-events-none opacity-[0.03] mix-blend-overlay" />
      
      {/* Soft atmospheric golden glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[80%] bg-gold/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[70%] bg-gold/5 blur-[140px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[460px] bg-white/40 backdrop-blur-3xl border border-white/60 p-12 sm:p-14 rounded-[3rem] shadow-luxury text-center relative z-10"
      >
        {/* Pulsing check/success circle */}
        <div className="w-16 h-16 bg-[#CBAE73]/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-luxury border border-[#CBAE73]/20 animate-pulse" style={{ animationDuration: '3s' }}>
          <Sparkles className="w-6 h-6 text-gold" />
        </div>

        <h1 className="text-3xl font-display tracking-tight text-text-dark mb-4">
          {firstName ? `Welcome back, ${firstName}` : 'Check Your Inbox'}
        </h1>
        
        <p className="text-xs text-text-dark/60 leading-relaxed max-w-sm mx-auto mb-4">
          {firstName ? "We've found your sanctuary." : `We've sent a secure sanctuary link to ${email}.`}
        </p>
        <p className="text-xs text-text-dark/60 leading-relaxed max-w-sm mx-auto mb-8">
          Check your email for your secure access link.
        </p>

        <div className="pt-6 border-t border-text-dark/5">
          <button
            onClick={() => navigate('/')}
            className="w-full py-5 bg-text-dark text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] shadow-luxury hover:bg-[#CBAE73] hover:text-black hover:scale-[1.02] active:scale-[0.98] transition-all duration-700 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return Home
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-text-dark/5 text-center">
          <button 
            onClick={() => navigate('/login')}
            className="text-[9px] font-bold tracking-[0.2em] text-gold hover:text-text-dark uppercase transition-colors duration-500"
          >
            Use a different email address
          </button>
        </div>
      </motion.div>

      {/* Footer copyright style */}
      <div className="absolute bottom-12 left-0 right-0 text-center pointer-events-none">
        <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-text-dark/10">LumaFlow Sanctuary</p>
      </div>
    </div>
  );
}
