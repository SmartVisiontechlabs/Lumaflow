import React, { useEffect, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookingFlow } from '../../hooks/useBookingFlow';
import { cn } from '../../lib/utils';
import StepHeading from './shared/StepHeading';
import { useCmsStore } from '../../store/cmsStore';

interface JourneyOption {
  id: string;
  title: string;
  description: string;
}

const journeys: JourneyOption[] = [
  {
    id: 'Breathwork',
    title: 'Breathwork',
    description: 'Active circular breathing to release emotional charge and access deep cellular flow.'
  },
  {
    id: 'Somatic Flow',
    title: 'Somatic Flow',
    description: 'Slow myofascial release, conscious movement, and nervous system regulation.'
  },
  {
    id: 'Deep Meditation',
    title: 'Deep Meditation',
    description: 'Astral expansion, stillness anchoring, and restorative third-eye awakening.'
  }
];

const JourneyStep = () => {
  const { journeyType, setJourneyType, nextStep } = useBookingFlow();
  const [hasSelected, setHasSelected] = useState(false);
  const offerings = useCmsStore(state => state.offerings);
  const fetchCMS = useCmsStore(state => state.fetchCMS);

  useEffect(() => {
    fetchCMS();
  }, [fetchCMS]);

  const activeOfferings = offerings.filter(o => o.is_active !== false);

  const displayJourneys: JourneyOption[] = activeOfferings.length > 0
    ? activeOfferings.map(o => ({
        id: o.title || '',
        title: o.title || '',
        description: o.description || o.benefit || ''
      }))
    : journeys;

  const handleSelect = (id: string) => {
    if (hasSelected) return;
    setJourneyType(id);
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
        tag="Intention"
        title="What are you seeking today?"
        subtitle="Choose the gateway that resonates with your spirit."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {displayJourneys.map((journey, index) => (
          <motion.button
            key={journey.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
            whileHover={!hasSelected ? {
              y: -5,
              scale: 1.015,
              boxShadow: "0 20px 40px -15px rgba(203, 174, 115, 0.15)",
            } : undefined}
            whileTap={!hasSelected ? { scale: 0.99 } : undefined}
            onClick={() => handleSelect(journey.id)}
            disabled={hasSelected}
            className={cn(
              "group relative p-10 rounded-[3rem] border transition-all duration-500 text-left overflow-hidden focus:outline-none flex flex-col justify-between min-h-[220px]",
              journeyType === journey.id
                ? "bg-gold border-gold text-white shadow-[0_15px_40px_rgba(203,174,115,0.35)] scale-[1.03]"
                : "bg-white/40 backdrop-blur-md border-text-dark/5 text-text-dark/60 hover:border-gold/30 hover:bg-white hover:text-text-dark shadow-sm"
            )}
          >
            {/* Ambient Shine */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2000ms]" />

            <div className="space-y-4">
              <h3 className={cn(
                "font-display text-2xl tracking-tight transition-colors duration-500",
                journeyType === journey.id ? "text-white" : "text-text-dark"
              )}>
                {journey.title}
              </h3>
              
              <p className={cn(
                "text-xs font-light leading-relaxed transition-colors duration-500",
                journeyType === journey.id ? "text-white/80" : "text-text-dark/50"
              )}>
                {journey.description}
              </p>
            </div>

            <div className="pt-6 flex justify-end items-center">
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-[0.3em] transition-all duration-500",
                journeyType === journey.id ? "text-white/90 translate-x-1" : "text-gold group-hover:translate-x-1"
              )}>
                Select Path &rarr;
              </span>
            </div>
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
              {journeyType === 'Breathwork' ? '“A pathway for release has been chosen.”' :
               journeyType === 'Somatic Flow' ? '“A pathway for embodiment has been chosen.”' :
               journeyType === 'Deep Meditation' ? '“A pathway for stillness has been chosen.”' :
               `“A pathway for ${journeyType.toLowerCase()} has been chosen.”`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default memo(JourneyStep);

