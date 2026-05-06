import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useBookingStore } from '../../store/bookingStore';
import BookingProgress from './BookingProgress';
import EmotionStep from './EmotionStep';
import SessionStep from './SessionStep';
import FormatStep from './FormatStep';
import DurationStep from './DurationStep';
import CalendarStep from './CalendarStep';
import TimeStep from './TimeStep';
import DetailsStep from './DetailsStep';
import ConfirmationStep from './ConfirmationStep';

// Component Map for Steps
const stepComponents: Record<number, React.ComponentType> = {
  1: EmotionStep,
  2: SessionStep,
  3: FormatStep,
  4: DurationStep,
  5: CalendarStep,
  6: TimeStep,
  7: DetailsStep,
  8: ConfirmationStep,
};

// Animation Variants - Simplified for performance
const contentVariants = {
  initial: { opacity: 0, y: 5, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -5, filter: 'blur(4px)' },
};

const transition = { duration: 0.6, ease: [0.22, 1, 0.36, 1] };

export default function BookingModal() {
  // Use specific selectors for performance optimization
  const isOpen = useBookingStore(state => state.isOpen);
  const currentStep = useBookingStore(state => state.currentStep);
  const closeBooking = useBookingStore(state => state.closeBooking);
  const selectedEmotion = useBookingStore(state => state.selectedEmotion);
  const selectedSession = useBookingStore(state => state.selectedSession);

  const StepComponent = useMemo(() => stepComponents[currentStep], [currentStep]);

  // Production-grade scroll lock with scrollbar compensation
  useEffect(() => {
    if (isOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`;
      document.body.classList.add('modal-open');
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="booking-modal-root"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* STATIC BACKDROP */}
          <div className="absolute inset-0 bg-[#0A0A0A]/95 backdrop-blur-xl" onClick={closeBooking} />

          {/* STATIC MODAL SHELL */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={transition}
            className="relative z-10 w-full h-full md:h-auto md:max-w-[960px] max-h-[100vh] md:max-h-[85vh] bg-cream md:rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl border border-white/10"
          >
            {/* Background Breathing */}
            <motion.div 
              animate={{ scale: [1, 1.01, 1] }}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-cream -z-10"
            />

            {/* CLOSE BUTTON */}
            <button
              onClick={closeBooking}
              className="absolute top-6 right-6 p-2 text-text-dark/10 hover:text-gold transition-all z-50 hover:bg-white/50 rounded-full focus:outline-none"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* MINIMAL MEMORY BAR */}
            <AnimatePresence>
              {currentStep > 1 && currentStep < 8 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-6 left-10 flex items-center gap-4 z-40 hidden sm:flex"
                >
                  <div className="flex flex-col">
                    <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-gold/60">State</span>
                    <span className="text-[9px] font-bold text-text-dark">{selectedEmotion}</span>
                  </div>
                  {selectedSession && (
                    <div className="flex flex-col border-l border-gold/10 pl-4">
                      <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-gold/60">Session</span>
                      <span className="text-[9px] font-bold text-text-dark">{selectedSession.name}</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* MAIN CONTENT AREA */}
            <div className="flex-grow overflow-y-auto relative flex flex-col">
              <div className="pt-16 pb-2">
                {currentStep < 8 && <BookingProgress />}
              </div>

              <div className="flex-grow flex items-start md:items-center justify-center py-8 px-6 md:px-16">
                <div className="w-full max-w-4xl mx-auto">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={currentStep}
                      variants={contentVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={transition}
                    >
                      <StepComponent />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
            
            {/* Grain Texture */}
            <div className="absolute inset-0 bg-grain opacity-[0.01] pointer-events-none z-50 mix-blend-overlay" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
