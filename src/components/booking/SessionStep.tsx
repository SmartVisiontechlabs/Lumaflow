import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useBookingFlow } from '../../hooks/useBookingFlow';
import { ChevronRight, ChevronLeft, Sparkles, Clock, Heart } from 'lucide-react';
import StepHeading from './shared/StepHeading';

const soulAlignmentImg = '/sessions/soul-alignment.png';

const SessionStep = () => {
  const { 
    selectedRitual, 
    ritualFocus, 
    recommendationQuote, 
    recommendationInsight,
    selectedDuration,
    nextStep, 
    prevStep 
  } = useBookingFlow();

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

      <div className="bg-white/60 backdrop-blur-2xl rounded-[3rem] border border-white/40 overflow-hidden flex flex-col md:flex-row min-h-[460px] relative shadow-luxury">

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
        <div className="md:w-[55%] p-12 md:p-14 flex flex-col justify-between gap-10">
          <div className="space-y-8">
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

            <p className="text-text-dark/80 font-light leading-relaxed text-xl italic font-display">
              “{recommendationQuote}”
            </p>

            <div className="p-8 bg-gold/[0.03] rounded-[2rem] border border-gold/10">
              <p className="text-[9px] text-gold font-bold uppercase tracking-[0.4em] mb-3 flex items-center gap-3">
                <Sparkles className="w-3.5 h-3.5" />
                Somatic Insight
              </p>

              <p className="text-sm text-text-dark/60 font-light leading-relaxed italic">
                {recommendationInsight}
              </p>
            </div>
          </div>

          <div className="flex gap-5">
            <button
              onClick={handleContinue}
              className="flex-grow py-5 bg-text-dark text-white rounded-full text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-gold transition-all duration-700 shadow-luxury active:scale-[0.98] group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Accept Path
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={prevStep}
        className="mt-10 mx-auto flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.4em] text-gold/30 hover:text-gold transition-all duration-700 focus:outline-none group cursor-pointer relative z-50"
      >
        <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
        Change Feeling
      </button>
    </div>
  );
};

export default memo(SessionStep);