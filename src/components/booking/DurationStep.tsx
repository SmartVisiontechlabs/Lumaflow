import React, { memo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookingFlow } from '../../hooks/useBookingFlow';
import { ChevronLeft, Clock, Heart, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import StepHeading from './shared/StepHeading';

const ALL_DURATIONS = [
  {
    id: 45,
    title: '45 Minutes',
    depth: 'Opening',
    intensity: 'Calm',
    description: 'A focused, gentle session to quiet the mind and body.',
  },
  {
    id: 60,
    title: '60 Minutes',
    depth: 'Alignment',
    intensity: 'Regulation',
    description: 'Perfect for a weekly ritual, tune-up, and integration.',
  },
  {
    id: 90,
    title: '90 Minutes',
    depth: 'Integration',
    intensity: 'Release',
    description: 'Allows the body to fully soften and release held tension.',
  },
  {
    id: 120,
    title: '120 Minutes',
    depth: 'Sacred',
    intensity: 'Transformation',
    description: 'Our most immersive ritual for somatic breakthrough.',
  },
];

const DurationStep = () => {
  const { selectedDuration, recommendedDuration, setDuration, nextStep, prevStep } = useBookingFlow();

  // Auto pre-select recommended duration on mount if user hasn't made a manual choice
  useEffect(() => {
    if (recommendedDuration && (selectedDuration === 60 || !selectedDuration)) {
      setDuration(recommendedDuration);
    }
  }, [recommendedDuration]);

  const handleSelect = (duration: number) => {
    setDuration(duration);
    setTimeout(nextStep, 600);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <StepHeading 
        tag="Depth"
        title="Honoring your time"
        subtitle="Select your preferred duration. Your recommended time is highlighted below."
      />

      {/* Recommended duration callout */}
      <AnimatePresence>
        {recommendedDuration > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gold/[0.07] border border-gold/15">
              <Sparkles className="w-3 h-3 text-gold/70" />
              <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-gold/70">
                {recommendedDuration} min recommended for your ritual
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {ALL_DURATIONS.map((item, index) => {
          const isSelected = selectedDuration === item.id;
          const isRecommended = recommendedDuration === item.id;

          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              whileHover={{
                y: -5,
                scale: 1.015,
                boxShadow: '0 20px 40px -15px rgba(203, 174, 115, 0.15)',
              }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleSelect(item.id)}
              className={cn(
                'group relative p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col items-start gap-8 overflow-hidden focus:outline-none h-full text-left cursor-pointer',
                isSelected
                  ? 'bg-text-dark text-white shadow-[0_15px_40px_rgba(203,174,115,0.25)] scale-[1.02] border-text-dark'
                  : isRecommended
                  ? 'bg-white/60 backdrop-blur-md border-gold/40 shadow-[0_8px_30px_rgba(203,174,115,0.12)] ring-1 ring-gold/20'
                  : 'bg-white/40 backdrop-blur-md border-text-dark/5 text-text-dark/60 hover:border-gold/30 shadow-sm'
              )}
            >
              {/* Top Row: Icon + Recommended Badge */}
              <div className="w-full flex justify-between items-start">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-700 border border-gold/5',
                  isSelected ? 'bg-gold text-white' : 'bg-gold/10 text-gold group-hover:bg-gold/20'
                )}>
                  <Clock className="w-5 h-5" />
                </div>

                {isRecommended && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[7px] font-bold uppercase tracking-[0.3em]',
                      isSelected
                        ? 'bg-gold/20 text-gold'
                        : 'bg-gold text-white shadow-sm'
                    )}
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    Recommended
                  </motion.div>
                )}
              </div>

              {/* Duration Label */}
              <div className="space-y-3 text-left flex-grow">
                <div>
                  <p className={cn(
                    'text-[8px] font-bold uppercase tracking-[0.4em] mb-1',
                    isSelected ? 'text-gold' : 'text-gold/60'
                  )}>{item.intensity}</p>
                  <h3 className="font-display text-3xl tracking-tight">{item.title}</h3>
                </div>
                <p className={cn(
                  'text-xs font-light italic leading-relaxed font-display',
                  isSelected ? 'text-white/50' : 'text-text-dark/40'
                )}>
                  "{item.description}"
                </p>
              </div>

              {/* Footer */}
              <div className={cn(
                'w-full pt-4 border-t flex items-center justify-between mt-auto',
                isSelected ? 'border-white/10' : 'border-text-dark/5'
              )}>
                <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-gold/60">{item.depth}</span>
                <Heart className={cn('w-3.5 h-3.5', isSelected ? 'text-gold' : 'text-gold/20')} />
              </div>

              {/* Glow bloom for recommended */}
              {isRecommended && !isSelected && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold/8 blur-[50px] rounded-full -mr-12 -mt-12 pointer-events-none" />
              )}

              {/* Glow bloom for selected */}
              {isSelected && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none" />
              )}
            </motion.button>
          );
        })}
      </div>

      <button 
        onClick={prevStep}
        className="mt-12 mx-auto flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.4em] text-gold/30 hover:text-gold transition-all duration-700 focus:outline-none group cursor-pointer relative z-50"
      >
        <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
        Change Format
      </button>
    </div>
  );
};

export default memo(DurationStep);
