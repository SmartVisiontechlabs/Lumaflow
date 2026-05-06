import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useBookingStore, type SessionDuration } from '../../store/bookingStore';
import { ChevronLeft, Clock, Heart } from 'lucide-react';
import { cn } from '../../lib/utils';
import StepHeading from './shared/StepHeading';

const durations: { id: SessionDuration; title: string; depth: string; description: string; intensity: string }[] = [
  {
    id: '60 Minutes',
    title: '60 Minutes',
    depth: 'Opening',
    intensity: 'Alignment',
    description: 'Perfect for a weekly tune-up and regulation.'
  },
  {
    id: '90 Minutes',
    title: '90 Minutes',
    depth: 'Integration',
    intensity: 'Release',
    description: 'Allows the body to fully soften and release held tension.'
  },
  {
    id: '120 Minutes',
    title: '120 Minutes',
    depth: 'Sacred',
    intensity: 'Transformation',
    description: 'Our most immersive ritual for somatic breakthrough.'
  }
];

const DurationStep = () => {
  const selectedDuration = useBookingStore(state => state.selectedDuration);
  const setDuration = useBookingStore(state => state.setDuration);
  const nextStep = useBookingStore(state => state.nextStep);
  const prevStep = useBookingStore(state => state.prevStep);

  const handleSelect = (duration: SessionDuration) => {
    setDuration(duration);
    setTimeout(nextStep, 500);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <StepHeading 
        tag="Depth"
        title="Honoring your time"
        subtitle="90 minutes is recommended for a complete release."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {durations.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            onClick={() => handleSelect(item.id)}
            className={cn(
              "group relative p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col items-start gap-6 overflow-hidden focus:outline-none",
              selectedDuration === item.id
                ? "bg-text-dark text-white shadow-xl"
                : "bg-white/40 backdrop-blur-sm border-text-dark/5 text-text-dark/60 hover:border-gold/30"
            )}
          >
            <div className="w-full flex justify-between items-start">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500",
                selectedDuration === item.id ? "bg-gold text-white" : "bg-gold/10 text-gold"
              )}>
                <Clock className="w-5 h-5" />
              </div>
              {item.id === '90 Minutes' && (
                <div className="px-3 py-1 bg-gold text-white text-[7px] font-bold uppercase tracking-[0.2em] rounded-full">
                  REC
                </div>
              )}
            </div>

            <div className="space-y-2 text-left">
              <div>
                <p className={cn(
                  "text-[8px] font-bold uppercase tracking-[0.2em] mb-1",
                  selectedDuration === item.id ? "text-gold" : "text-gold/60"
                )}>{item.intensity}</p>
                <h3 className="font-display text-3xl">{item.title}</h3>
              </div>
              <p className={cn(
                "text-sm font-light italic leading-relaxed",
                selectedDuration === item.id ? "text-white/60" : "text-text-dark/40"
              )}>
                “{item.description}”
              </p>
            </div>

            <div className={cn(
              "w-full pt-4 border-t flex items-center justify-between",
              selectedDuration === item.id ? "border-white/10" : "border-text-dark/5"
            )}>
              <span className="text-[8px] font-bold uppercase tracking-[0.2em]">{item.depth}</span>
              <Heart className={cn("w-3 h-3", selectedDuration === item.id ? "text-gold" : "text-gold/20")} />
            </div>
          </motion.button>
        ))}
      </div>

      <button 
        onClick={prevStep}
        className="mt-8 mx-auto flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 hover:text-gold transition-colors duration-500 focus:outline-none"
      >
        <ChevronLeft className="w-3 h-3" /> Back
      </button>
    </div>
  );
};

export default memo(DurationStep);
