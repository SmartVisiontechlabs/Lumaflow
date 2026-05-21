import { motion } from 'framer-motion';
import { useBookingStore } from '../../store/bookingStore';
import { cn } from '../../lib/utils';

const STEPS = [
  { id: 1, label: 'Journey' },
  { id: 2, label: 'Feeling' },
  { id: 3, label: 'Ritual' },
  { id: 4, label: 'Plan' },
  { id: 5, label: 'Format' },
  { id: 6, label: 'Duration' },
  { id: 7, label: 'Date' },
  { id: 8, label: 'Time' }
];

export default function BookingProgress() {
  const currentStep = useBookingStore((state) => state.currentStep);
  const entrySource = useBookingStore((state) => state.entrySource);
  const goToStep = useBookingStore((state) => state.goToStep);

  const visibleSteps = entrySource === 'offering'
    ? STEPS.filter(step => step.id !== 1)
    : entrySource === 'pricing'
    ? STEPS.filter(step => step.id !== 4)
    : STEPS;
  
  const activeIndex = visibleSteps.findIndex(step => step.id === currentStep);
  const progress = activeIndex !== -1
    ? ((activeIndex + 1) / visibleSteps.length) * 100
    : 100;

  return (
    <div className="w-full max-w-4xl mx-auto px-2">
      {/* Responsive Horizontal Scroll for Step Tabs */}
      <div className="flex justify-between items-center mb-2.5 overflow-x-auto md:overflow-x-visible scrollbar-none pb-0 gap-4 md:gap-0">
        {visibleSteps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isLocked = currentStep < step.id;

          return (
            <div key={step.id} className="flex flex-col items-center gap-3 relative shrink-0">
              <button
                disabled={isLocked}
                onClick={() => goToStep(step.id)}
                className={cn(
                  "relative z-10 text-[9px] font-bold uppercase tracking-[0.3em] transition-all duration-700 focus:outline-none whitespace-nowrap",
                  isActive ? "text-gold scale-110" : 
                  isCompleted ? "text-gold/60 hover:text-gold" : 
                  "text-text-dark/25"
                )}
              >
                {step.label}
              </button>
              
              {isActive && (
                <motion.div 
                  layoutId="active-step-indicator"
                  className="absolute -bottom-2 w-1 h-1 bg-gold rounded-full"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="h-[1px] w-full bg-gold/[0.08] overflow-hidden rounded-full">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-gold shadow-[0_0_10px_rgba(203,174,115,0.4)]"
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
