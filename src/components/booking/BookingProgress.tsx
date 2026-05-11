import { motion } from 'framer-motion';
import { useBookingStore } from '../../store/bookingStore';
import { cn } from '../../lib/utils';

const STEPS = [
  { id: 1, label: 'Feeling' },
  { id: 2, label: 'Ritual' },
  { id: 3, label: 'Format' },
  { id: 4, label: 'Duration' },
  { id: 5, label: 'Date' },
  { id: 6, label: 'Time' },
  { id: 7, label: 'Details' }
];

export default function BookingProgress() {
  const currentStep = useBookingStore((state) => state.currentStep);
  const goToStep = useBookingStore((state) => state.goToStep);
  
  const progress = (currentStep / 8) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto mb-16 px-4">
      <div className="flex justify-between items-center mb-6">
        {STEPS.map((step, idx) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isLocked = currentStep < step.id;

          return (
            <div key={step.id} className="flex flex-col items-center gap-3 relative group">
              <button
                disabled={isLocked}
                onClick={() => goToStep(step.id)}
                className={cn(
                  "relative z-10 text-[9px] font-bold uppercase tracking-[0.3em] transition-all duration-700 focus:outline-none",
                  isActive ? "text-gold scale-110" : 
                  isCompleted ? "text-text-dark/40 hover:text-gold" : 
                  "text-text-dark/10"
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

      <div className="h-[1px] w-full bg-text-dark/5 overflow-hidden rounded-full">
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
