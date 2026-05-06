import React, { useEffect, useState, memo } from 'react';
import { motion } from 'framer-motion';
import { useBookingStore, type Emotion } from '../../store/bookingStore';
import { cn } from '../../lib/utils';
import StepHeading from './shared/StepHeading';

const emotions: Emotion[] = [
  'Stressed',
  'Heavy',
  'Disconnected',
  'Seeking Clarity',
  'Emotionally Drained',
  'Anxious'
];

const EmotionStep = () => {
  const selectedEmotion = useBookingStore(state => state.selectedEmotion);
  const setEmotion = useBookingStore(state => state.setEmotion);
  const nextStep = useBookingStore(state => state.nextStep);
  
  const [hasSelected, setHasSelected] = useState(false);

  const handleSelect = (emotion: Emotion) => {
    if (hasSelected) return;
    setEmotion(emotion);
    setHasSelected(true);
  };

  useEffect(() => {
    if (hasSelected) {
      const timer = setTimeout(() => {
        nextStep();
      }, 1000); // Optimized timing
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {emotions.map((emotion, index) => (
          <motion.button
            key={emotion}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            onClick={() => handleSelect(emotion)}
            disabled={hasSelected}
            className={cn(
              "group relative p-10 rounded-[2rem] border transition-all duration-500 uppercase text-[10px] font-bold tracking-[0.3em] overflow-hidden focus:outline-none",
              selectedEmotion === emotion
                ? "bg-gold border-gold text-white shadow-lg"
                : "bg-white/40 backdrop-blur-sm border-text-dark/5 text-text-dark/60 hover:border-gold/30 hover:bg-white"
            )}
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <span className="relative z-10">{emotion}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default memo(EmotionStep);
