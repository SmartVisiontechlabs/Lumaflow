import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useBookingFlow } from '../../hooks/useBookingFlow';
import { stepTransition } from '../../animations/bookingTransitions';
import BookingProgress from './BookingProgress';
import EmotionStep from './EmotionStep';
import SessionStep from './SessionStep';
import FormatStep from './FormatStep';
import DurationStep from './DurationStep';
import CalendarStep from './CalendarStep';
import TimeStep from './TimeStep';
import DetailsStep from './DetailsStep';
import ConfirmationStep from './ConfirmationStep';
import { useBookingStore } from '../../store/bookingStore';

import ResumeStep from './ResumeStep';

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

export default function BookingModal() {
  const { 
    isOpen, 
    currentStep, 
    closeBooking, 
    emotionalState, 
    selectedRitual,
    showResumePrompt
  } = useBookingFlow();

  const StepComponent = useMemo(() => stepComponents[currentStep], [currentStep]);

  // Session Timeout Monitor (Background check while modal is open)
  useEffect(() => {
    if (!isOpen) return;

    const checkTimeout = () => {
      const { lastActivityTimestamp, resetBooking } = useBookingStore.getState();
      if (!lastActivityTimestamp) return;

      const now = Date.now();
      const timeout = 15 * 60 * 1000;

      if (now - lastActivityTimestamp > timeout) {
        resetBooking();
      }
    };

    const interval = setInterval(checkTimeout, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [isOpen]);

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
          transition={{ duration: 0.8 }}
        >
          {/* STATIC BACKDROP */}
          <div className="absolute inset-0 bg-[#0A0A0A]/95 backdrop-blur-xl" onClick={closeBooking} />

          {/* STATIC MODAL SHELL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full h-full md:h-auto md:max-w-[1024px] max-h-[100vh] md:max-h-[90vh] bg-cream md:rounded-[3rem] overflow-hidden flex flex-col shadow-luxury border border-white/10"
          >
            {/* Background Breathing */}
            <motion.div 
              animate={{ scale: [1, 1.01, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-cream -z-10"
            />

            {/* CLOSE BUTTON */}
            <button
              onClick={closeBooking}
              className="absolute top-8 right-8 p-3 text-text-dark/20 hover:text-gold transition-all z-50 hover:bg-white/50 rounded-full focus:outline-none"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* MINIMAL MEMORY BAR */}
            <AnimatePresence>
              {currentStep > 1 && currentStep < 8 && !showResumePrompt && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="absolute top-8 left-12 flex items-center gap-6 z-40 hidden sm:flex"
                >
                  <div className="flex flex-col">
                    <span className="text-[7px] font-bold uppercase tracking-[0.4em] text-gold/60">Atmosphere</span>
                    <span className="text-[10px] font-bold text-text-dark uppercase tracking-widest">{emotionalState}</span>
                  </div>
                  {selectedRitual && (
                    <div className="flex flex-col border-l border-gold/20 pl-6">
                      <span className="text-[7px] font-bold uppercase tracking-[0.4em] text-gold/60">Recommendation</span>
                      <span className="text-[10px] font-bold text-text-dark uppercase tracking-widest">{selectedRitual}</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* MAIN CONTENT AREA */}
            <div className="flex-grow overflow-y-auto relative flex flex-col">
              <div className="pt-20 pb-4">
                {currentStep < 8 && !showResumePrompt && <BookingProgress />}
              </div>

              <div className="flex-grow flex items-start md:items-center justify-center py-12 px-8 md:px-20">
                <div className="w-full max-w-5xl mx-auto">
                  <AnimatePresence mode="wait" initial={false}>
                    {showResumePrompt ? (
                      <ResumeStep key="resume-step" />
                    ) : (
                      <motion.div
                        key={currentStep}
                        variants={stepTransition}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        <StepComponent />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            
            {/* Grain Texture */}
            <div className="absolute inset-0 bg-grain opacity-[0.02] pointer-events-none z-50 mix-blend-overlay" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
,
    document.body
  );
}
