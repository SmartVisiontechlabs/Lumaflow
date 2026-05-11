import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useBookingFlow } from '../../hooks/useBookingFlow';
import { CheckCircle2, Sparkles, Clock, MapPin, Calendar, Mail, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { format, parseISO, parse } from 'date-fns';
import { bookingService } from '../../services/bookingService';
import { getLocalTimeForEST } from '../../utils/bookingUtils';

const ConfirmationStep = () => {
  const { 
    emotionalState,
    selectedRitual, 
    selectedDate, 
    selectedTime, 
    selectedDuration,
    sessionFormat, 
    fullName,
    email, 
    intentions,
    lastBookingReference,
    isSubmitting,
    setBookingReference,
    setIsSubmitting,
    resetBooking, 
    closeBooking,
    prevStep
  } = useBookingFlow();
  
  const navigate = useNavigate();

  const handleSecureBooking = async () => {
    if (lastBookingReference) return; // Already booked

    setIsSubmitting(true);
    try {
      const booking = await bookingService.createBooking({
        emotion: emotionalState,
        recommendedPath: selectedRitual,
        selectedSession: selectedRitual,
        sessionFormat: sessionFormat as any,
        duration: selectedDuration,
        selectedDate: selectedDate,
        selectedTime: selectedTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        fullName,
        email,
        intentions
      });
      setBookingReference(booking.bookingReference);
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
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

        {/* BOOKING SUMMARY CARD */}
        <div className="bg-white/70 backdrop-blur-3xl border border-white/50 rounded-[4rem] p-12 shadow-luxury text-left grid grid-cols-1 md:grid-cols-2 gap-10 relative overflow-hidden">
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold/60">Selected Ritual</p>
              <p className="font-display text-3xl text-text-dark tracking-tight">{selectedRitual}</p>
            </div>
            
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-4 text-text-dark/70">
                <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-gold" />
                </div>
                <span className="text-sm font-medium tracking-wide uppercase text-[10px]">{sessionFormat}</span>
              </div>
              <div className="flex items-center gap-4 text-text-dark/70">
                <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-gold" />
                </div>
                <span className="text-sm font-light tracking-wide">{email}</span>
              </div>
            </div>
          </div>

          <div className="space-y-8 md:border-l border-gold/10 md:pl-12">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold/60">Appointed Moment</p>
              <p className="font-display text-3xl text-text-dark tracking-tight">
                {parsedDate && format(parsedDate, 'MMMM do, yyyy')}
              </p>
            </div>
            
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-4 text-text-dark/70">
                <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-gold" />
                </div>
                <span className="text-sm font-light italic font-display">Preparation guide dispatched</span>
              </div>
              <div className="flex flex-col gap-1 text-text-dark/70">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-gold" />
                  </div>
                  <span className="text-sm font-bold text-gold uppercase tracking-[0.4em]">
                    {selectedTime && format(parse(selectedTime, 'HH:mm', new Date()), 'hh:mm a')} EST
                  </span>
                </div>
                {selectedDate && selectedTime && (
                  <p className="text-[10px] text-text-dark/40 italic pl-12">
                    Local Time: {getLocalTimeForEST(selectedDate, selectedTime)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Decorative Bloom */}
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-gold/5 blur-[80px] rounded-full pointer-events-none" />
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col gap-8 items-center pt-6">
          <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
            <button 
              onClick={handleSecureBooking}
              disabled={isSubmitting || !!lastBookingReference}
              className="px-12 py-6 bg-text-dark text-white rounded-full text-[11px] font-bold uppercase tracking-[0.4em] shadow-luxury hover:bg-gold transition-all duration-700 active:scale-[0.98] group flex-grow sm:flex-grow-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                {isSubmitting ? "Securing Your Space..." : lastBookingReference ? "Booking Confirmed" : "Continue to Secure Booking"}
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
