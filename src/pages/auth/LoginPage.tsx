import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import MagicLinkForm from '../../components/auth/MagicLinkForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-gold/10 selection:text-gold">
      {/* Background grain overlay */}
      <div className="absolute inset-0 bg-grain pointer-events-none opacity-[0.03] mix-blend-overlay" />
      
      {/* Soft atmospheric golden glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[80%] bg-gold/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[70%] bg-gold/5 blur-[140px] rounded-full pointer-events-none" />

      {/* Header logo */}
      <header className="absolute top-0 left-0 right-0 h-[88px] px-8 flex items-center justify-start z-20">
        <Link to="/" className="flex items-center h-12">
          <img
            src="/gold-logo.png"
            alt="Lumaflow"
            className="h-10 w-auto object-contain drop-shadow-[0_0_8px_rgba(203,174,115,0.6)] brightness-110"
          />
        </Link>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[460px] bg-white/40 backdrop-blur-3xl border border-white/60 p-12 sm:p-14 rounded-[3rem] shadow-luxury relative z-10"
      >
        <div className="text-center mb-12">
          {/* Pulsing branding circle */}
          <div className="w-16 h-16 bg-text-dark rounded-full flex items-center justify-center mx-auto mb-8 shadow-button relative group hover:scale-105 transition-transform duration-700">
            <Compass className="w-6 h-6 text-gold animate-breathe" />
            <div className="absolute inset-0 rounded-full border border-gold/20 scale-125 opacity-0 group-hover:opacity-100 transition-all duration-1000" />
          </div>
          
          <h1 className="text-3xl font-display tracking-tight text-text-dark mb-4">Continue Your Journey</h1>
          <p className="text-xs text-text-dark/60 leading-relaxed max-w-xs mx-auto">
            Enter the email associated with your sanctuary. A secure access link will guide you back to your journey.
          </p>
        </div>

        {/* Passwordless Login Form */}
        <MagicLinkForm />

        <div className="mt-12 pt-8 border-t border-text-dark/5 text-center">
          <p className="text-[9px] font-bold tracking-[0.2em] text-text-dark/20 uppercase">
            Secure Sanctuary Entry
          </p>
        </div>
      </motion.div>

      {/* Footer Return Home */}
      <footer className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-4 z-20">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-dark/50 hover:text-gold transition-colors duration-500"
        >
          <span>←</span> Return Home
        </Link>
        <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-text-dark/10">LumaFlow Sanctuary</p>
      </footer>
    </div>
  );
}
