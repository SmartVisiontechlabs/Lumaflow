import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Sparkles, MapPin, Calendar, Clock, Mail, X } from 'lucide-react';
import { useBookingFlow } from '../../hooks/useBookingFlow';
import { stepTransition } from '../../animations/bookingTransitions';
import BookingProgress from '../../components/booking/BookingProgress';
import { getConfidenceConfig, type ConfidenceLevel } from '../../lib/healingRecommendations';
import { useNavigate } from 'react-router-dom';
import JourneyStep from '../../components/booking/JourneyStep';
import EmotionStep from '../../components/booking/EmotionStep';
import SessionStep from '../../components/booking/SessionStep';
import PlanStep from '../../components/booking/PlanStep';
import FormatStep from '../../components/booking/FormatStep';
import DurationStep from '../../components/booking/DurationStep';
import CalendarStep from '../../components/booking/CalendarStep';
import TimeStep from '../../components/booking/TimeStep';
import ConfirmationStep from '../../components/booking/ConfirmationStep';
import ResumeStep from '../../components/booking/ResumeStep';
import { useAuth } from '../../providers/AuthProvider';
import { bookingService } from '../../services/bookingService';
import { useBookingStore } from '../../store/bookingStore';
import SEOMetadata from '../../components/seo/SEOMetadata';

const stepComponents: Record<number, React.ComponentType> = {
  1: JourneyStep,
  2: EmotionStep,
  3: SessionStep,
  4: PlanStep,
  5: FormatStep,
  6: DurationStep,
  7: CalendarStep,
  8: TimeStep,
  9: ConfirmationStep,
};

const getPricingMicrocopy = (packageName: string) => {
  const name = packageName.toLowerCase();
  if (name.includes('starter') || name.includes('intro')) {
    return '“A deeper healing rhythm awaits.”';
  } else if (name.includes('single')) {
    return '“A gentle beginning has been prepared.”';
  } else if (name.includes('10-class') || name.includes('ten') || name.includes('package')) {
    return '“A long-form transformation journey begins.”';
  }
  return '“A gentle beginning has been prepared.”'; // fallback
};

export default function BookPage() {
  const { 
    isOpen, 
    currentStep, 
    entrySource,
    journeyType,
    emotionalState, 
    selectedRitual,
    selectedPackage,
    selectedDate,
    selectedTime,
    sessionFormat,
    selectedDuration,
    recommendedDuration,
    confidence,
    showResumePrompt,
    openBooking,
    closeBooking,
    prevStep,
    fetchRecommendationMatrix
  } = useBookingFlow();

  const { user, loading: authLoading } = useAuth();
  const resumeFromDraftBooking = useBookingStore(state => state.resumeFromDraftBooking);

  useEffect(() => {
    if (authLoading) return;
    
    // Only check if user is logged in and not starting a package session via plan query
    const params = new URLSearchParams(window.location.search);
    const planSlug = params.get('plan');
    if (planSlug) return;

    if (user) {
      bookingService.getActiveDraftBooking(user.id).then((draft) => {
        if (draft) {
          console.log('[BookPage] Active backend draft found. Prompting resume:', draft);
          resumeFromDraftBooking(draft);
        }
      }).catch((err) => {
        console.error('[BookPage] Failed to fetch active draft:', err);
      });
    }
  }, [user, authLoading, resumeFromDraftBooking]);

  const confidenceConfig = confidence ? getConfidenceConfig(confidence as ConfidenceLevel) : null;

  const [showExitModal, setShowExitModal] = useState(false);
  const StepComponent = useMemo(() => stepComponents[currentStep], [currentStep]);
  const navigate = useNavigate();

  const showSummary = useMemo(() => {
    return ((currentStep > 1 || (entrySource === 'pricing' && currentStep === 1)) && currentStep < 9 && !showResumePrompt);
  }, [currentStep, entrySource, showResumePrompt]);

  // If page is loaded directly, initialize booking state once with query parameter check
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planSlug = params.get('plan');
    
    if (planSlug) {
      const plansList = [
        { id: '772407fa-1b48-4f0f-80d5-1b343ada98c1', slug: 'single-session', name: 'Single Session', credits: 1, price: 45 },
        { id: 'e69dfd27-1da5-4584-b410-72b1ea76c48f', slug: 'intro-offer', name: 'Starter Healing Journey', credits: 3, price: 99 },
        { id: 'ecca0c9b-42c6-4fbe-aec5-a1651ab6a29b', slug: '10-class-package', name: '10-Class Package', credits: 10, price: 350 }
      ];
      
      const matched = plansList.find(p => 
        p.slug === planSlug || 
        (planSlug === 'membership10' && p.slug === '10-class-package') ||
        (planSlug === 'membership3' && p.slug === 'intro-offer') ||
        (planSlug === 'drop-in' && p.slug === 'single-session')
      );

      if (matched) {
        console.log('[BookPage] Pre-populating package from plan:', planSlug, matched);
        openBooking(
          { id: matched.id, name: matched.name, credits: matched.credits, price: matched.price },
          { entrySource: 'pricing' }
        );
      } else {
        if (!isOpen) openBooking();
      }
    } else {
      if (!isOpen) openBooking();
    }
    fetchRecommendationMatrix();
  }, []);

  // Redirect to home if user explicitly closes the booking flow
  useEffect(() => {
    if (!isOpen) {
      navigate('/');
    }
  }, [isOpen, navigate]);

  const getDisplayStep = () => {
    if (entrySource === 'offering') {
      return { current: currentStep - 1, total: 7 };
    }
    if (entrySource === 'pricing') {
      const current = currentStep > 3 ? currentStep - 1 : currentStep;
      return { current, total: 7 };
    }
    return { current: currentStep, total: 8 };
  };

  const displayStep = getDisplayStep();

  // CRITICAL: Prevent layout blinking/flashing during redirects or initial load
  if (!isOpen) return null;

  return (
    <div className="min-h-screen bg-cream relative flex flex-col pt-0 pb-20">
      <SEOMetadata />
      
      {/* CINEMATIC LUMINOUS BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.05, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-gold/5 rounded-full blur-[140px]"
        />
        <motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1.05, 1, 1.05] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px]"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full flex-grow flex flex-col px-6">
        
        {/* STICKY TOP HEADER SYSTEM (TABS + EXIT) */}
        {currentStep < 9 && !showResumePrompt && (
          <div className="sticky top-[92px] z-40 px-4 md:px-0 mb-6 w-full flex items-center justify-center">
            <div className="w-full max-w-4xl bg-white/50 backdrop-blur-2xl border border-gold/[0.06] py-2.5 px-8 rounded-full shadow-[0_16px_40px_rgba(203,174,115,0.08)] transition-all flex items-center justify-between min-h-[60px] relative">
              <div className="flex-grow pr-36">
                <BookingProgress />
              </div>
              
              {/* EXIT BUTTON */}
              <button
                onClick={() => setShowExitModal(true)}
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 text-text-dark/40 hover:text-gold transition-colors items-center gap-2 group text-[9px] font-bold uppercase tracking-[0.2em] bg-white/60 hover:bg-white px-4 py-2.5 rounded-full border border-gold/5 shadow-sm"
                aria-label="Exit booking"
              >
                <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 duration-500" />
                <span>Exit Booking</span>
              </button>
              
              {/* Mobile Exit */}
              <button
                onClick={() => setShowExitModal(true)}
                className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 text-text-dark/40 hover:text-gold transition-colors p-2"
                aria-label="Exit booking"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* MAIN STEPS CONTENT AREA — pt-4 gives luxury breathing room below capsule */}
        {showSummary ? (
          <div className="flex-grow w-full grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start pt-4">
            {/* Main Content */}
            <div className="w-full scroll-mt-40">
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
                    className="w-full"
                  >
                    {entrySource === 'pricing' && currentStep === 1 && selectedPackage && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, delay: 0.2 }}
                        className="text-center font-display italic text-gold/60 text-sm tracking-widest mb-8"
                      >
                        {getPricingMicrocopy(selectedPackage.name)}
                      </motion.p>
                    )}
                    <StepComponent />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Side Summary (Desktop - 320px fixed) */}
            <AnimatePresence>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="hidden lg:block w-[320px] sticky top-[180px]"
              >
                <div className="bg-white/80 backdrop-blur-3xl border border-gold/10 p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(203,174,115,0.08)]">
                  <h3 className="font-display text-2xl mb-6 text-text-dark tracking-tight">Healing Journey</h3>
                  
                  <div className="space-y-5 text-sm font-light text-text-dark/80">
                    <AnimatePresence mode="popLayout">
                      {journeyType && (
                        <motion.div 
                          key={journeyType}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.3 }}
                          className="pb-4 border-b border-gold/10"
                        >
                          <div className="text-[9px] font-bold uppercase tracking-widest text-gold mb-1">Journey Path</div>
                          <div className="font-semibold text-text-dark">{journeyType}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence mode="popLayout">
                      {selectedPackage && (
                        <motion.div 
                          key={selectedPackage.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.3 }}
                          className="flex justify-between items-center pb-4 border-b border-gold/10 pt-2"
                        >
                          <span className="font-medium">{selectedPackage.name}</span>
                          <span className="text-gold font-medium">${selectedPackage.price}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <AnimatePresence mode="popLayout">
                      {emotionalState && (
                        <motion.div 
                          key={emotionalState}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.3 }}
                          className="pb-4 border-b border-gold/10 pt-2"
                        >
                          <div className="text-[9px] font-bold uppercase tracking-widest text-gold mb-1">Atmosphere</div>
                          <div className="capitalize">{emotionalState}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <AnimatePresence mode="popLayout">
                      {selectedRitual && (
                        <motion.div 
                          key={selectedRitual}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.3 }}
                          className="pb-3 border-b border-gold/10 pt-2 space-y-2"
                        >
                          <div className="text-[9px] font-bold uppercase tracking-widest text-gold mb-1">Ritual</div>
                          <div className="text-sm font-light leading-snug">{selectedRitual}</div>
                          {/* Confidence inline badge */}
                          {confidenceConfig && (
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${confidenceConfig.bgColor} mt-1`}>
                              <Sparkles className={`w-2.5 h-2.5 ${confidenceConfig.color}`} />
                              <span className={`text-[7px] font-bold uppercase tracking-[0.3em] ${confidenceConfig.color}`}>
                                {confidenceConfig.label}
                              </span>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <AnimatePresence mode="popLayout">
                      {(sessionFormat || selectedDuration > 0) && (
                        <motion.div 
                          key={`${sessionFormat}-${selectedDuration}`}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-4 pb-4 border-b border-gold/10 pt-2"
                        >
                          {sessionFormat && <div className="capitalize">{sessionFormat}</div>}
                          {selectedDuration > 0 && <div className="text-text-dark/60 border-l border-gold/20 pl-4">{selectedDuration} Min</div>}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence mode="popLayout">
                      {(selectedDate || selectedTime) && (
                        <motion.div 
                          key={`${selectedDate}-${selectedTime}`}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.3 }}
                          className="pt-2 space-y-3"
                        >
                          {selectedDate && (
                            <div className="flex items-center gap-3">
                              <Calendar className="w-4 h-4 text-gold/60" />
                              <span>{selectedDate}</span>
                            </div>
                          )}
                          {selectedTime && (
                            <div className="flex items-center gap-3">
                              <Clock className="w-4 h-4 text-gold/60" />
                              <span>{selectedTime}</span>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex-grow w-full flex justify-center pt-4">
            <div className="w-full max-w-[840px] scroll-mt-40">
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
                    className="w-full"
                  >
                    <StepComponent />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

      </div>

      {/* MOBILE BOTTOM SUMMARY (Appears above the navigation bar) */}
      <AnimatePresence>
        {((currentStep > 1 || (entrySource === 'pricing' && currentStep === 1)) && currentStep < 9 && !showResumePrompt) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="lg:hidden fixed bottom-[88px] left-0 w-full z-40 px-4"
          >
            <div className="bg-white/95 backdrop-blur-xl border border-gold/10 p-4 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] flex justify-between items-center">
                 <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gold/80 mb-0.5">Current Path</p>
                    <AnimatePresence mode="wait">
                      <motion.p 
                        key={selectedRitual || selectedPackage?.name || 'Aligning...'}
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -3 }}
                        transition={{ duration: 0.25 }}
                        className="text-xs font-medium text-text-dark truncate max-w-[200px]"
                      >
                        {selectedRitual || selectedPackage?.name || 'Aligning...'}
                      </motion.p>
                    </AnimatePresence>
                 </div>
                 {selectedPackage && (
                   <AnimatePresence mode="wait">
                     <motion.span 
                       key={selectedPackage.price}
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       transition={{ duration: 0.25 }}
                       className="text-gold font-bold text-sm"
                     >
                       ${selectedPackage.price}
                     </motion.span>
                   </AnimatePresence>
                 )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STICKY BOTTOM NAVIGATION BAR */}
      <AnimatePresence>
        {((currentStep > 1 || (entrySource === 'pricing' && currentStep === 1)) && currentStep < 9 && !showResumePrompt) && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-0 left-0 w-full bg-cream/90 backdrop-blur-md border-t border-gold/10 py-6 px-12 z-[100] flex justify-between items-center shadow-luxury"
          >
            <button
              onClick={prevStep}
              className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em] text-text-dark/40 hover:text-gold transition-colors group focus:outline-none"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Refine Previous Step
            </button>
            <div className="text-[9px] font-bold tracking-[0.3em] text-gold/60 uppercase">
              Step {displayStep.current} of {displayStep.total}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PREMIUM EXIT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showExitModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            {/* Backdrop with strong blur & dark overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExitModal(false)}
              className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-white/95 backdrop-blur-2xl border border-gold/10 p-10 md:p-12 rounded-[2.5rem] shadow-[0_30px_70px_rgba(203,174,115,0.15)] max-w-md w-full text-center space-y-8 z-10"
            >
              <div className="space-y-3">
                <h4 className="font-display text-2xl text-text-dark tracking-tight">
                  Leave this sacred moment?
                </h4>
                <p className="text-xs text-text-dark/50 font-light leading-relaxed">
                  Your selections will remain gently preserved.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setShowExitModal(false)}
                  className="w-full py-4 bg-text-dark hover:bg-gold text-white rounded-full text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-500 shadow-md active:scale-98 cursor-pointer"
                >
                  Continue Journey
                </button>
                <button
                  onClick={() => {
                    setShowExitModal(false);
                    closeBooking();
                  }}
                  className="w-full py-4 bg-transparent hover:bg-gold/5 text-gold hover:text-gold rounded-full text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-500 border border-gold/20 cursor-pointer"
                >
                  Return Home
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Grain Texture */}
      <div className="absolute inset-0 bg-grain opacity-[0.02] pointer-events-none z-50 mix-blend-overlay" />
    </div>
  );
}
