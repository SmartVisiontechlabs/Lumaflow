import React, { useEffect, useState, memo } from 'react';
import { motion } from 'framer-motion';
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
      }, 1000); 
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
            onClick={() => handleSelect(emotion)}
            disabled={hasSelected}
            className={cn(
              "group relative p-12 rounded-[2.5rem] border transition-all duration-700 uppercase text-[10px] font-bold tracking-[0.4em] overflow-hidden focus:outline-none",
              emotionalState === emotion
                ? "bg-gold border-gold text-white shadow-luxury scale-[1.02]"
                : "bg-white/40 backdrop-blur-md border-text-dark/5 text-text-dark/60 hover:border-gold/30 hover:bg-white hover:text-text-dark"
            )}
          >
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500" />
            
            <span className="relative z-10">{emotion}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default memo(EmotionStep);
