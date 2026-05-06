import { motion } from 'framer-motion';
import { useBookingStore } from '../../store/bookingStore';

const TOTAL_STEPS = 8;

export default function BookingProgress() {
  const currentStep = useBookingStore((state) => state.currentStep);
  const progress = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto mb-12">
      <div className="flex justify-between items-end mb-2 px-2">
        <div className="space-y-0.5">
          <p className="text-[8px] font-medium uppercase tracking-[0.3em] text-gold/60">
            Step {currentStep} of {TOTAL_STEPS}
          </p>
        </div>
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
