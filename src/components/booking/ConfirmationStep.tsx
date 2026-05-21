import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useBookingFlow } from '../../hooks/useBookingFlow';
import { CheckCircle2, Sparkles, Clock, MapPin, Calendar, Mail, ChevronLeft, ChevronRight, Loader2, User, MessageSquare } from 'lucide-react';
import { format, parseISO, parse } from 'date-fns';
import { paymentService } from '../../services/paymentService';
import { getLocalTimeForEST } from '../../utils/bookingUtils';
import { ritualJourneyMap } from '../../data/recommendationMap';
import { cn } from '../../lib/utils';

const ConfirmationStep = () => {
  const { 
    journeyType,
    emotionalState,
    selectedRitual, 
    selectedPackage,
    selectedDate, 
    selectedTime, 
    selectedDuration,
    sessionFormat, 
    fullName,
    email, 
    intentions,
    lastBookingReference,
    isSubmitting,
    setUserDetails,
    setBookingReference,
    setIsSubmitting,
    resetBooking, 
    closeBooking,
    prevStep
  } = useBookingFlow();
  
  const navigate = useNavigate();
  const [activeField, setActiveField] = useState<string | null>(null);

  const isFormValid = fullName.trim().length > 2 && email.includes('@') && email.includes('.');

  const handleSecureBooking = async () => {
    if (lastBookingReference || !isFormValid) return;

    setIsSubmitting(true);
    try {
      const checkoutUrl = await paymentService.createCheckoutSession({
        emotion: emotionalState,
        selectedSession: selectedRitual,
        sessionFormat: sessionFormat as any,
        duration: selectedDuration,
        selectedDate: selectedDate,
        selectedTime: selectedTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        fullName,
        email,
        intentions,
        selectedPackage,
        journeyType // Include journeyType
      });
      
      // Redirect to Stripe Hosted Checkout
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Payment initialization failed:', error);
      setIsSubmitting(false);
    }
  };

  const parsedDate = selectedDate ? parseISO(selectedDate) : null;

  return (
    <div className="relative min-h-[60vh] flex items-center justify-center py-12 px-6 overflow-hidden">
      {/* IMMERSIVE BACKGROUND EFFECTS */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-[160px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-4xl w-full text-center space-y-14"
      >
        <div className="space-y-10">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: "backOut" }}
            className="relative w-28 h-28 mx-auto"
          >
            <div className="absolute inset-0 bg-gold/30 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-full h-full bg-gold rounded-full flex items-center justify-center shadow-luxury border border-white/30">
              {isSubmitting ? (
                <Loader2 className="w-14 h-14 text-white animate-spin" />
              ) : (
                <CheckCircle2 className="w-14 h-14 text-white" />
              )}
            </div>
          </motion.div>
          
          <div className="space-y-6">
            <h2 className="font-display text-5xl md:text-7xl text-text-dark leading-tight tracking-tight">
              {lastBookingReference ? "Sanctuary Secured" : "Your sanctuary"} <br />
              <span className="italic text-gold">
                {lastBookingReference ? "Welcome Home" : "has been reserved"}
              </span>
            </h2>
            {lastBookingReference ? (
              <div className="inline-flex flex-col items-center gap-3">
                <p className="text-text-dark/40 font-light text-sm uppercase tracking-[0.5em]">Booking Reference</p>
                <p className="text-gold font-bold text-3xl tracking-[0.2em] font-display">{lastBookingReference}</p>
              </div>
            ) : (
              <p className="text-text-dark/40 font-light text-xl italic max-w-lg mx-auto leading-relaxed font-display">
                “A gentle confirmation has been prepared. Your journey towards expansion has already begun.”
              </p>
            )}
          </div>
        </div>

        {/* BOOKING SUMMARY AND DETAILS CARD */}
        <div className="bg-white/70 backdrop-blur-3xl border border-white/50 rounded-[4rem] p-12 shadow-luxury text-left grid grid-cols-1 lg:grid-cols-2 gap-12 relative overflow-hidden">
          {/* LEFT: SUMMARY DETAILS */}
          <div className="space-y-8">
            <div className="space-y-6 pb-6 border-b border-gold/10 relative">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold/80">Selected Journey</p>
                <p className="font-display text-3xl text-text-dark tracking-tight">
                  {journeyType || "Breathwork"}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold/80">Healing Plan</p>
                <p className="font-display text-2xl text-text-dark/90 tracking-tight">
                  {selectedPackage?.name || "Single Session"}
                </p>
                <div className="flex gap-8 pt-1">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-dark/40">Investment: </span>
                    <span className="text-sm font-semibold text-gold">${selectedPackage?.price || 45}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-dark/40">Sessions: </span>
                    <span className="text-sm font-semibold text-text-dark/80">{selectedPackage?.credits || 1}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold/60">Recommended Ritual</p>
                <p className="font-display text-2xl text-text-dark tracking-tight">{selectedRitual}</p>
              </div>
              
              <div className="flex flex-wrap gap-x-8 gap-y-4 pt-2">
                <div className="flex items-center gap-3 text-text-dark/70">
                  <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-gold" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[10px]">{sessionFormat}</span>
                </div>
                
                <div className="flex items-center gap-3 text-text-dark/70">
                  <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-gold" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[10px]">{selectedDuration} Minutes</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-gold/5">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold/60">Appointed Moment</p>
                <p className="font-display text-2xl text-text-dark tracking-tight">
                  {parsedDate && format(parsedDate, 'MMMM do, yyyy')}
                </p>
              </div>
              
              <div className="flex flex-col gap-1 text-text-dark/70">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-gold" />
                  </div>
                  <span className="text-sm font-bold text-gold uppercase tracking-[0.3em]">
                    {selectedTime && format(parse(selectedTime, 'HH:mm', new Date()), 'hh:mm a')} EST
                  </span>
                </div>
                {selectedDate && selectedTime && (
                  <p className="text-[10px] text-text-dark/40 italic pl-11">
                    Local Time: {getLocalTimeForEST(selectedDate, selectedTime)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: DETAILS INPUT FORM */}
          <div className="space-y-6 lg:border-l border-gold/10 lg:pl-12 flex flex-col justify-center">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold/80">Client Details</p>
              <p className="text-xs font-light text-text-dark/40">Please provide your details to secure this sacred container.</p>
            </div>

            <div className="space-y-6">
              {/* Full Name */}
              <div className="relative">
                <div className={cn(
                  "absolute left-6 top-1/2 -translate-y-1/2 transition-colors duration-700",
                  activeField === 'fullName' ? "text-gold" : "text-text-dark/10"
                )}>
                  <User className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  placeholder=" "
                  autoComplete="name"
                  value={fullName}
                  onFocus={() => setActiveField('fullName')}
                  onBlur={() => setActiveField(null)}
                  onChange={(e) => setUserDetails({ fullName: e.target.value })}
                  className={cn(
                    "peer w-full pl-16 pr-6 pt-7 pb-2.5 bg-white/40 border border-text-dark/5 rounded-[1.5rem] focus:outline-none focus:border-gold/30 focus:bg-white transition-all text-sm font-light text-text-dark",
                    fullName && "border-gold/20"
                  )}
                />
                <label className="absolute left-16 top-2 text-[8px] font-bold uppercase tracking-[0.3em] text-text-dark/30 transition-all duration-700 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[8px]">
                  Full Name
                </label>
              </div>

              {/* Email Address */}
              <div className="relative">
                <div className={cn(
                  "absolute left-6 top-1/2 -translate-y-1/2 transition-colors duration-700",
                  activeField === 'email' ? "text-gold" : "text-text-dark/10"
                )}>
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email" 
                  placeholder=" "
                  autoComplete="email"
                  value={email}
                  onFocus={() => setActiveField('email')}
                  onBlur={() => setActiveField(null)}
                  onChange={(e) => setUserDetails({ email: e.target.value })}
                  className={cn(
                    "peer w-full pl-16 pr-6 pt-7 pb-2.5 bg-white/40 border border-text-dark/5 rounded-[1.5rem] focus:outline-none focus:border-gold/30 focus:bg-white transition-all text-sm font-light text-text-dark",
                    email && "border-gold/20"
                  )}
                />
                <label className="absolute left-16 top-2 text-[8px] font-bold uppercase tracking-[0.3em] text-text-dark/30 transition-all duration-700 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[8px]">
                  Email Address
                </label>
              </div>

              {/* Intentions */}
              <div className="relative">
                <div className={cn(
                  "absolute left-6 top-6 transition-colors duration-700",
                  activeField === 'intentions' ? "text-gold" : "text-text-dark/10"
                )}>
                  <MessageSquare className="w-5 h-5" />
                </div>
                <textarea 
                  placeholder=" "
                  rows={3}
                  value={intentions}
                  onFocus={() => setActiveField('intentions')}
                  onBlur={() => setActiveField(null)}
                  onChange={(e) => setUserDetails({ intentions: e.target.value })}
                  className={cn(
                    "peer w-full pl-16 pr-6 pt-9 pb-4 bg-white/40 border border-text-dark/5 rounded-[1.8rem] focus:outline-none focus:border-gold/30 focus:bg-white transition-all text-sm font-light text-text-dark resize-none leading-relaxed",
                    intentions && "border-gold/20"
                  )}
                />
                <label className="absolute left-16 top-3 text-[8px] font-bold uppercase tracking-[0.3em] text-text-dark/30 transition-all duration-700 peer-placeholder-shown:top-6 peer-placeholder-shown:text-xs peer-focus:top-3 peer-focus:text-[8px]">
                  Primary Intention
                </label>
              </div>
            </div>
          </div>

          {/* Decorative Bloom */}
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-gold/5 blur-[80px] rounded-full pointer-events-none" />
        </div>

        {/* FOLLOWING RITUALS (JOURNEY RECOMMENDATION) */}
        {lastBookingReference && ritualJourneyMap[selectedRitual] && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="space-y-10"
          >
            <div className="flex flex-col items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-gold/60">The Journey Continues</span>
              <h3 className="font-display text-4xl text-text-dark">Following Rituals</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {ritualJourneyMap[selectedRitual].map((next, i) => (
                <div key={i} className="group relative bg-white/40 border border-gold/10 rounded-[3rem] p-10 text-left hover:bg-white/80 transition-all duration-700 hover:shadow-luxury">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-gold" />
                    </div>
                    <span className="text-[9px] font-bold text-gold uppercase tracking-[0.3em]">{next.duration}m</span>
                  </div>
                  
                  <h4 className="font-display text-2xl text-text-dark mb-3 group-hover:text-gold transition-colors">{next.ritual}</h4>
                  <p className="text-[10px] text-text-dark/40 uppercase tracking-widest font-bold mb-4">{next.focus}</p>
                  <p className="text-sm text-text-dark/60 font-light leading-relaxed italic border-t border-gold/5 pt-6">“{next.quote}”</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ACTIONS */}
        <div className="flex flex-col gap-8 items-center pt-6">
          <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
            <button 
              onClick={handleSecureBooking}
              disabled={isSubmitting || !!lastBookingReference || !isFormValid}
              className="px-12 py-6 bg-text-dark text-white rounded-full text-[11px] font-bold uppercase tracking-[0.4em] shadow-luxury hover:bg-gold transition-all duration-700 active:scale-[0.98] group flex-grow sm:flex-grow-0 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                {isSubmitting ? "Opening Portal..." : lastBookingReference ? "Booking Confirmed" : "Secure & Proceed to Payment"}
                {!isSubmitting && !lastBookingReference && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              </span>
            </button>
            
            {!lastBookingReference && (
              <button 
                onClick={prevStep}
                disabled={isSubmitting}
                className="px-12 py-6 bg-white/40 border border-text-dark/10 text-text-dark/60 rounded-full text-[11px] font-bold uppercase tracking-[0.3em] hover:border-gold/40 hover:text-gold transition-all duration-700 active:scale-[0.98] group flex-grow sm:flex-grow-0 disabled:opacity-50"
              >
                <ChevronLeft className="inline-block w-4 h-4 mr-2 mb-0.5 group-hover:-translate-x-1 transition-transform" />
                Refine Preferences
              </button>
            )}
          </div>

          {lastBookingReference ? (
            <button 
              onClick={() => { resetBooking(); closeBooking(); }}
              className="px-12 py-4 border border-gold/20 text-gold rounded-full text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gold hover:text-white transition-all duration-700"
            >
              Return to Sanctuary
            </button>
          ) : (
            <button 
              onClick={resetBooking}
              disabled={isSubmitting}
              className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold/30 hover:text-gold transition-all duration-700 focus:outline-none py-2 disabled:opacity-0"
            >
              Start Fresh
            </button>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 text-[10px] text-gold/60 font-bold uppercase tracking-[0.4em]">
          <Sparkles className="w-4 h-4 animate-pulse" /> {lastBookingReference ? "A ritual guide has been sent to your inbox" : "Sacred confirmation prepared for your inbox"}
        </div>
      </motion.div>
    </div>
  );
};

export default memo(ConfirmationStep);
