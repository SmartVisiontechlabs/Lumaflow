import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useBookingFlow } from '../../hooks/useBookingFlow';
import { ChevronLeft, Clock, Heart } from 'lucide-react';
import { cn } from '../../lib/utils';
import StepHeading from './shared/StepHeading';

const durations = [
  {
    id: 60,
    title: '60 Minutes',
    depth: 'Opening',
    intensity: 'Alignment',
    description: 'Perfect for a weekly tune-up and regulation.'
  },
  {
    id: 90,
    title: '90 Minutes',
    depth: 'Integration',
    intensity: 'Release',
    description: 'Allows the body to fully soften and release held tension.'
  },
  {
    id: 120,
    title: '120 Minutes',
    depth: 'Sacred',
    intensity: 'Transformation',
    description: 'Our most immersive ritual for somatic breakthrough.'
  }
];

const DurationStep = () => {
  const { selectedDuration, setDuration, nextStep, prevStep } = useBookingFlow();

  const handleSelect = (duration: number) => {
    setDuration(duration);
    setTimeout(nextStep, 600);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <StepHeading 
        tag="Depth"
        title="Honoring your time"
        subtitle="90 minutes is recommended for a complete somatic release."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {durations.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            onClick={() => handleSelect(item.id)}
            className={cn(
              "group relative p-10 rounded-[3rem] border transition-all duration-700 flex flex-col items-start gap-8 overflow-hidden focus:outline-none",
              selectedDuration === item.id
                ? "bg-text-dark text-white shadow-luxury scale-[1.02] border-text-dark"
                : "bg-white/40 backdrop-blur-md border-text-dark/5 text-text-dark/60 hover:border-gold/30"
            )}
          >
            <div className="w-full flex justify-between items-start">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-700 border border-gold/5",
                selectedDuration === item.id ? "bg-gold text-white" : "bg-gold/10 text-gold group-hover:bg-gold/20"
              )}>
                <Clock className="w-6 h-6" />
              </div>
              {item.id === 90 && (
                <div className="px-4 py-1.5 bg-gold text-white text-[8px] font-bold uppercase tracking-[0.3em] rounded-full shadow-sm">
                  Recommended
                </div>
              )}
            </div>

            <div className="space-y-3 text-left">
              <div>
                <p className={cn(
                  "text-[9px] font-bold uppercase tracking-[0.4em] mb-1.5",
                  selectedDuration === item.id ? "text-gold" : "text-gold/60"
                )}>{item.intensity}</p>
                <h3 className="font-display text-4xl tracking-tight">{item.title}</h3>
              </div>
              <p className={cn(
                "text-sm font-light italic leading-relaxed font-display",
                selectedDuration === item.id ? "text-white/50" : "text-text-dark/40"
              )}>
                “{item.description}”
              </p>
            </div>

            <div className={cn(
              "w-full pt-6 border-t flex items-center justify-between",
              selectedDuration === item.id ? "border-white/10" : "border-text-dark/5"
            )}>
              <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold/60">{item.depth}</span>
              <Heart className={cn("w-4 h-4", selectedDuration === item.id ? "text-gold" : "text-gold/20")} />
            </div>

            {/* Selection Bloom Effect */}
            {selectedDuration === item.id && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none" />
            )}
          </motion.button>
        ))}
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
