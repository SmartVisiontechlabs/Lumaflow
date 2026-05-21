import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookingFlow } from '../../hooks/useBookingFlow';
import { ChevronRight, ChevronLeft, Sparkles, Clock, Heart, Shield, Info } from 'lucide-react';
import StepHeading from './shared/StepHeading';
import { getConfidenceConfig, type ConfidenceLevel } from '../../lib/healingRecommendations';

const soulAlignmentImg = '/sessions/soul-alignment.png';

const SessionStep = () => {
  const { 
    selectedRitual, 
    ritualFocus, 
    recommendationQuote, 
    recommendationInsight,
    confidence,
    confidenceReason,
    selectedDuration,
    nextStep, 
    prevStep 
  } = useBookingFlow();

  const confidenceConfig = confidence
    ? getConfidenceConfig(confidence as ConfidenceLevel)
    : null;

  const handleContinue = () => {
    nextStep();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <StepHeading
        tag="The Recommendation"
        title="Your Recommended Path"
        subtitle="Our intelligence has aligned your current state with this specific ritual."
      />

      {/* ── CONFIDENCE BADGE (above the card) ────────────────────────── */}
      <AnimatePresence>
        {confidenceConfig && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center mb-8"
          >
            <div className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full ${confidenceConfig.bgColor}`}>
              <Sparkles className={`w-3 h-3 ${confidenceConfig.color}`} />
              <span className={`text-[9px] font-bold uppercase tracking-[0.35em] ${confidenceConfig.color}`}>
                {confidenceConfig.label}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN RECOMMENDATION CARD ─────────────────────────────────── */}
      <motion.div 
        whileHover={{
          y: -4,
          scale: 1.005,
          boxShadow: "0 30px 60px -15px rgba(203, 174, 115, 0.18)",
        }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white/60 backdrop-blur-2xl rounded-[3rem] border border-gold/20 overflow-hidden flex flex-col md:flex-row min-h-[460px] relative shadow-[0_20px_50px_rgba(203,174,115,0.12)]"
      >

        {/* IMAGE SECTION */}
        <div className="md:w-[45%] relative overflow-hidden bg-cream/50">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            src={soulAlignmentImg}
            alt={selectedRitual}
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="absolute bottom-10 left-10 text-white space-y-3">
            <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.4em] text-gold/90">
              <Clock className="w-3.5 h-3.5" />
              {selectedDuration} Minutes
            </div>

            <h3 className="font-display text-4xl leading-tight">
              {selectedRitual}
            </h3>
          </div>
        </div>

        {/* CONTENT SECTION */}
        <div className="md:w-[55%] p-12 md:p-14 flex flex-col justify-between gap-8">
          <div className="space-y-7">

            {/* Ritual Focus */}
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center text-gold border border-gold/5">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold mb-1">
                  Ritual Focus
                </p>
                <p className="text-base font-semibold text-text-dark tracking-wide">
                  {ritualFocus}
                </p>
              </div>
            </div>

            {/* Anchor Quote */}
            <p className="text-text-dark/80 font-light leading-relaxed text-xl italic font-display">
              "{recommendationQuote}"
            </p>

            {/* WHY THIS WAS CHOSEN — Healing Intelligence Insight */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="p-7 bg-gold/[0.03] rounded-[2rem] border border-gold/10 space-y-4"
            >
              <div className="flex items-center gap-3">
                <Info className="w-3.5 h-3.5 text-gold/60 shrink-0" />
                <p className="text-[9px] text-gold font-bold uppercase tracking-[0.4em]">
                  Why this was chosen for you
                </p>
              </div>

              <p className="text-sm text-text-dark/60 font-light leading-relaxed italic">
                {recommendationInsight}
              </p>

              {/* Confidence reason micro-line */}
              {confidenceReason && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="flex items-start gap-2.5 pt-3 border-t border-gold/[0.08]"
                >
                  <Shield className="w-3 h-3 text-gold/40 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-text-dark/35 font-light leading-relaxed tracking-wide">
                    {confidenceReason}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>

          <div className="space-y-5">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="font-display italic text-gold text-xs tracking-widest text-center"
            >
              "Curated for your present state."
            </motion.p>

            <div className="flex gap-5">
              <button
                onClick={handleContinue}
                className="flex-grow py-5 bg-text-dark text-white rounded-full text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-gold transition-all duration-700 shadow-luxury active:scale-[0.98] group cursor-pointer"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Accept Path
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default memo(SessionStep);