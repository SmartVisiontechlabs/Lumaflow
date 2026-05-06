import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useBookingStore, type SessionFormat } from '../../store/bookingStore';
import { ChevronLeft, Video, Users, Home as HomeIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import StepHeading from './shared/StepHeading';

const formats: { id: SessionFormat; title: string; description: string; benefit: string; icon: any }[] = [
  {
    id: 'Virtual',
    title: 'Virtual Session',
    description: 'Deeply personal guidance for emotional release from your own home.',
    benefit: 'Private Sanctuary',
    icon: Video
  },
  {
    id: 'In-Person',
    title: 'Studio Experience',
    description: 'A full nervous-system reset in a calming, curated physical space.',
    benefit: 'Complete Immersion',
    icon: HomeIcon
  },
  {
    id: 'Group',
    title: 'Collective Ritual',
    description: 'Connect with the shared energy of a small, intentional community.',
    benefit: 'Shared Resonance',
    icon: Users
  }
];

const FormatStep = () => {
  const selectedFormat = useBookingStore(state => state.selectedFormat);
  const setFormat = useBookingStore(state => state.setFormat);
  const nextStep = useBookingStore(state => state.nextStep);
  const prevStep = useBookingStore(state => state.prevStep);

  const handleSelect = (format: SessionFormat) => {
    setFormat(format);
    setTimeout(nextStep, 500);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <StepHeading 
        tag="The Container"
        title="Where shall we meet?"
        subtitle="Choose the space that feels most supportive for your journey."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {formats.map((format, index) => (
          <motion.button
            key={format.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            onClick={() => handleSelect(format.id)}
            className={cn(
              "group relative p-10 rounded-[2rem] border transition-all duration-500 text-center flex flex-col items-center gap-6 overflow-hidden focus:outline-none",
              selectedFormat === format.id
                ? "bg-white border-gold shadow-lg"
                : "bg-white/40 backdrop-blur-sm border-text-dark/5 hover:border-gold/30 hover:bg-white"
            )}
          >
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500",
              selectedFormat === format.id ? "bg-gold text-white shadow-md" : "bg-gold/10 text-gold"
            )}>
              <format.icon strokeWidth={1.5} className="w-6 h-6" />
            </div>

            <div className="space-y-4 relative z-10">
              <div className="space-y-1">
                <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-gold">{format.benefit}</p>
                <h3 className="font-display text-2xl text-text-dark">{format.title}</h3>
              </div>
              <p className="text-text-dark/50 font-light leading-relaxed text-sm italic">
                “{format.description}”
              </p>
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

export default memo(FormatStep);
