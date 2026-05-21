import React, { useEffect, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookingFlow } from '../../hooks/useBookingFlow';
import { cn } from '../../lib/utils';
import StepHeading from './shared/StepHeading';

const emotions = [
  'Stressed',
  'Heavy',
  'Disconnected',
  'Seeking Clarity',
  'Emotionally Drained',
  'Anxious'
];

const getEmotionMicrocopy = (emotion: string) => {
  switch (emotion) {
    case 'Heavy':
      return '“Your body’s signal has been acknowledged.”';
    case 'Stressed':
      return '“A space for decompression is opening.”';
    case 'Disconnected':
      return '“A path back to center is unfolding.”';
    case 'Seeking Clarity':
      return '“The dust is beginning to settle.”';
    case 'Emotionally Drained':
      return '“Gentle restoration is prepared for you.”';
    case 'Anxious':
      return '“A calming anchorage is drawing near.”';
    default:
      return '“Your present state is held with care.”';
  }
};

const EmotionStep = () => {
  const { emotionalState, setEmotionalState, nextStep } = useBookingFlow();
  const [hasSelected, setHasSelected] = useState(false);

  const handleSelect = (emotion: string) => {
    if (hasSelected) return;
    setEmotionalState(emotion);
    setHasSelected(true);
  };

  useEffect(() => {
    if (hasSelected) {
      const timer = setTimeout(() => {
        nextStep();
      }, 1400); // 1.4s sacred pause to absorb message
      return () => clearTimeout(timer);
    }
  }, [hasSelected, nextStep]);

  return (
    <div className="max-w-4xl mx-auto">
      <StepHeading 
        tag="Attunement"
        title="How are you feeling?"
        subtitle="Understanding what your body needs."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {emotions.map((emotion, index) => (
          <motion.button
            key={emotion}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            whileHover={!hasSelected ? {
              y: -4,
              scale: 1.015,
              boxShadow: "0 15px 30px -10px rgba(203, 174, 115, 0.15)",
            } : undefined}
            whileTap={!hasSelected ? { scale: 0.99 } : undefined}
            onClick={() => handleSelect(emotion)}
            disabled={hasSelected}
            className={cn(
              "group relative p-12 rounded-[2.5rem] border transition-all duration-500 uppercase text-[10px] font-bold tracking-[0.4em] overflow-hidden focus:outline-none",
              emotionalState === emotion
                ? "bg-gold border-gold text-white shadow-[0_15px_40px_rgba(203,174,115,0.35)] scale-[1.02]"
                : "bg-white/40 backdrop-blur-md border-text-dark/5 text-text-dark/60 hover:border-gold/30 hover:bg-white hover:text-text-dark shadow-sm"
            )}
          >
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500" />
            
            <span className="relative z-10">{emotion}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {hasSelected && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mt-16"
          >
            <span className="font-display italic text-gold text-sm tracking-widest block">
              {getEmotionMicrocopy(emotionalState)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default memo(EmotionStep);
