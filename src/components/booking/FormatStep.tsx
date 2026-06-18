import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useBookingFlow } from '../../hooks/useBookingFlow';
import { ChevronLeft, Video, Users, Home as HomeIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import StepHeading from './shared/StepHeading';

const formats = [
  {
    id: 'Virtual',
    title: 'Virtual Experience',
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
  }
];

const FormatStep = () => {
  const { sessionFormat, setSessionFormat, nextStep, prevStep } = useBookingFlow();

  const handleSelect = (format: string) => {
    setSessionFormat(format);
    setTimeout(nextStep, 600);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <StepHeading 
        tag="The Container"
        title="Where shall we meet?"
        subtitle="Choose the space that feels most supportive for your journey."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {formats.map((format, index) => (
          <motion.button
            key={format.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            onClick={() => handleSelect(format.id)}
            className={cn(
              "group relative p-12 rounded-[3rem] border transition-all duration-700 text-center flex flex-col items-center gap-8 overflow-hidden focus:outline-none",
              sessionFormat === format.id
                ? "bg-white border-gold shadow-luxury scale-[1.02]"
                : "bg-white/40 backdrop-blur-md border-text-dark/5 hover:border-gold/30 hover:bg-white"
            )}
          >
            <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-700 border border-gold/5",
              sessionFormat === format.id ? "bg-gold text-white shadow-luxury" : "bg-gold/10 text-gold group-hover:bg-gold/20"
            )}>
              <format.icon strokeWidth={1.2} className="w-8 h-8" />
            </div>

            <div className="space-y-5 relative z-10">
              <div className="space-y-2">
                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold">{format.benefit}</p>
                <h3 className="font-display text-3xl text-text-dark">{format.title}</h3>
              </div>
              <p className="text-text-dark/40 font-light leading-relaxed text-sm italic font-display">
                “{format.description}”
              </p>
            </div>

            {/* Premium selection indicator */}
            {sessionFormat === format.id && (
              <motion.div 
                layoutId="format-selection"
                className="absolute top-6 right-6 w-3 h-3 bg-gold rounded-full"
              />
            )}
          </motion.button>
        ))}
      </div>

    </div>
  );
};

export default memo(FormatStep);
