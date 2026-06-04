import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useBookingFlow } from '../../hooks/useBookingFlow';
import { Sparkles, RefreshCw, ArrowRight } from 'lucide-react';

const ResumeStep = () => {
  const { 
    setShowResumePrompt, 
    resetBooking, 
    selectedRitual, 
    emotionalState,
    goToStep
  } = useBookingFlow();

  const handleResume = () => {
    setShowResumePrompt(false);
    goToStep(5);
  };

  const handleStartFresh = () => {
    resetBooking();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-xl mx-auto w-full"
    >
      <div className="bg-white/60 backdrop-blur-3xl rounded-[4rem] p-16 border border-white/40 shadow-luxury text-center space-y-12 relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="space-y-6 relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="flex justify-center"
          >
            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center text-gold border border-gold/5">
              <Sparkles className="w-8 h-8" />
            </div>
          </motion.div>

          <div className="space-y-4">
            <h2 className="font-display text-4xl text-text-dark tracking-tight">
              Continue Your <br />
              <span className="italic text-gold">Ritual Journey</span>
            </h2>
            <p className="text-text-dark/40 font-light text-sm italic leading-relaxed font-display">
              “We have preserved your previous selections. Would you like to resume your path or begin a new attunement?”
            </p>
          </div>
        </div>

        {/* SAVED STATE PREVIEW */}
        <div className="py-8 px-10 bg-gold/[0.03] rounded-[2.5rem] border border-gold/10 text-left space-y-4 relative z-10">
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold/60">Saved Intentions</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-dark/40 uppercase tracking-widest">Feeling</span>
              <span className="text-[11px] font-bold text-text-dark uppercase tracking-widest">{emotionalState}</span>
            </div>
            {selectedRitual && (
              <div className="flex items-center justify-between border-t border-gold/5 pt-2">
                <span className="text-[10px] text-text-dark/40 uppercase tracking-widest">Path</span>
                <span className="text-[11px] font-bold text-text-dark uppercase tracking-widest">{selectedRitual}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 relative z-10">
          <button
            onClick={handleResume}
            className="w-full py-6 bg-text-dark text-white rounded-full text-[11px] font-bold uppercase tracking-[0.5em] shadow-luxury hover:bg-gold transition-all duration-1000 group active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              Resume Journey
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-700" />
            </span>
          </button>

          <button
            onClick={handleStartFresh}
            className="flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em] text-gold/30 hover:text-gold transition-all duration-700 group focus:outline-none"
          >
            <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-1000" />
            Start Fresh
          </button>
        </div>

        {/* Decorative Texture */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gold/5 blur-[60px] rounded-full pointer-events-none" />
      </div>
    </motion.div>
  );
};

export default memo(ResumeStep);
