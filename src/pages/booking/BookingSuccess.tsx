import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Sparkles, Calendar, Clock, Mail, ChevronRight } from 'lucide-react';
import { format, parseISO, parse } from 'date-fns';
import { paymentService } from '../../services/paymentService';
import { useBookingStore } from '../../store/bookingStore';
import { getLocalTimeForEST } from '../../utils/bookingUtils';

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const { setBookingReference, resetBooking } = useBookingStore();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [bookingData, setBookingData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const hasConfirmed = useRef(false);

  useEffect(() => {
    const confirmBooking = async () => {
      if (!sessionId || hasConfirmed.current) {
        if (!sessionId) {
          setStatus('error');
          setError('Missing session information.');
        }
        return;
      }
      
      hasConfirmed.current = true;

      try {
        const booking = await paymentService.confirmPayment(sessionId);
        setBookingData(booking);
        setBookingReference(booking.bookingReference);
        setStatus('success');
        
        // Optional: clear some store state but keep reference for the UI
      } catch (err: any) {
        console.error('Confirmation error:', err);
        setStatus('error');
        setError(err.message || 'Failed to confirm your ritual.');
      }
    };

    confirmBooking();
  }, [sessionId, setBookingReference]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="text-center space-y-8">
          <Loader2 className="w-16 h-16 text-gold animate-spin mx-auto" />
          <div className="space-y-4">
            <h2 className="font-display text-4xl text-text-dark italic">Securing your sanctuary...</h2>
            <p className="text-text-dark/40 uppercase tracking-[0.4em] text-[10px] font-bold">Aligning the celestial frequencies</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/50 backdrop-blur-xl border border-red-200/50 p-12 rounded-[3rem] text-center space-y-8 shadow-luxury">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <span className="text-4xl">⚠️</span>
          </div>
          <div className="space-y-4">
            <h2 className="font-display text-3xl text-text-dark">Journey Interrupted</h2>
            <p className="text-sm text-text-dark/60 leading-relaxed font-light">{error}</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-5 bg-text-dark text-white rounded-full text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-gold transition-all duration-700"
          >
            Return to Sanctuary
          </button>
        </div>
      </div>
    );
  }

  const parsedDate = bookingData?.selectedDate ? parseISO(bookingData.selectedDate) : null;

  return (
    <div className="min-h-screen bg-cream relative overflow-hidden flex flex-col items-center justify-center py-20 px-6">
      {/* Immersive Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ opacity: [0.2, 0.3, 0.2], scale: [1.1, 1, 1.1] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-4xl w-full space-y-12 text-center"
      >
        <div className="space-y-8">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-gold/30 rounded-full blur-2xl" />
            <div className="relative w-full h-full bg-gold rounded-full flex items-center justify-center shadow-luxury border border-white/30">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="font-display text-5xl md:text-7xl text-text-dark tracking-tight leading-tight">
              Sanctuary <span className="italic text-gold">Secured</span>
            </h1>
            <div className="flex flex-col items-center gap-3">
              <span className="text-[10px] font-bold text-text-dark/30 uppercase tracking-[0.5em]">Booking Reference</span>
              <span className="font-display text-4xl text-gold tracking-[0.2em]">{bookingData?.bookingReference}</span>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white/60 backdrop-blur-3xl border border-white/50 rounded-[4rem] p-12 shadow-luxury grid grid-cols-1 md:grid-cols-2 gap-12 text-left relative overflow-hidden">
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold/60">Selected Ritual</p>
              <p className="font-display text-3xl text-text-dark">{bookingData?.selectedSession}</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-text-dark/70">
                <Mail className="w-4 h-4 text-gold/60" />
                <span className="text-sm font-light">{bookingData?.email}</span>
              </div>
              <div className="flex items-center gap-4 text-text-dark/70 uppercase tracking-widest text-[10px] font-bold">
                <Sparkles className="w-4 h-4 text-gold/60" />
                <span>{bookingData?.sessionFormat} Session</span>
              </div>
            </div>
          </div>

          <div className="space-y-8 md:border-l border-gold/10 md:pl-12">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold/60">Appointment Moment</p>
              <p className="font-display text-3xl text-text-dark">
                {parsedDate && format(parsedDate, 'MMMM do, yyyy')}
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-4">
                  <Clock className="w-4 h-4 text-gold/60" />
                  <span className="text-sm font-bold text-gold uppercase tracking-[0.3em]">
                    {bookingData?.selectedTime && format(parse(bookingData.selectedTime, 'HH:mm', new Date()), 'hh:mm a')} EST
                  </span>
                </div>
                {bookingData?.selectedDate && bookingData?.selectedTime && (
                  <p className="text-[9px] text-text-dark/40 italic pl-8">
                    Local Time: {getLocalTimeForEST(bookingData.selectedDate, bookingData.selectedTime)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <Calendar className="w-4 h-4 text-gold/60" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-dark/40">Portal guide dispatched to inbox</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* SECTION: Prepare For Your Session */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-both">
          <div className="space-y-2">
            <h2 className="font-display text-3xl text-text-dark italic">Prepare For Your Session</h2>
            <p className="text-text-dark/40 uppercase tracking-[0.4em] text-[10px] font-bold">Reserve this sacred moment in your calendar.</p>
          </div>

          <div className="flex justify-center">
            <button 
              onClick={() => {
                if (!bookingData) return;
                const startTime = bookingData.selectedDate.replace(/-/g, '') + 'T' + bookingData.selectedTime.replace(/:/g, '') + '00';
                
                // End time calculation (approximate using duration)
                const startHour = parseInt(bookingData.selectedTime.split(':')[0]);
                const startMin = parseInt(bookingData.selectedTime.split(':')[1]);
                const totalMins = startHour * 60 + startMin + (bookingData.duration || 60);
                const endHour = Math.floor(totalMins / 60);
                const endMin = totalMins % 60;
                const endTime = bookingData.selectedDate.replace(/-/g, '') + 'T' + 
                              endHour.toString().padStart(2, '0') + 
                              endMin.toString().padStart(2, '0') + '00';

                const calendarTitle = encodeURIComponent('LumaFlow Healing Session');
                const calendarDetails = encodeURIComponent(`Ritual: ${bookingData.selectedSession}\nBooking Reference: ${bookingData.bookingReference}\n\nPreparation Notes: Please arrive hydrated, comfortable, and in a quiet space.`);
                
                const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${calendarTitle}&dates=${startTime}/${endTime}&details=${calendarDetails}&ctz=America/New_York`;
                
                window.open(googleCalendarUrl, '_blank');
              }}
              className="px-10 py-5 border border-gold bg-gold/5 text-gold rounded-full text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gold hover:text-white transition-all duration-700 flex items-center gap-3 shadow-luxury"
            >
              <Calendar className="w-4 h-4" />
              Add to Google Calendar
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-8 items-center">
          <button 
            onClick={() => { resetBooking(); navigate('/'); }}
            className="px-16 py-6 bg-text-dark text-white rounded-full text-[11px] font-bold uppercase tracking-[0.4em] shadow-luxury hover:bg-gold transition-all duration-700 group"
          >
            <span className="flex items-center gap-2">
              Return to Sanctuary
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          
          <p className="text-text-dark/30 font-display italic text-lg max-w-md mx-auto">
            “Your space is held. Prepare gently for your arrival.”
          </p>
        </div>
      </motion.div>
      
      {/* Grain Texture */}
      <div className="fixed inset-0 bg-grain opacity-[0.03] pointer-events-none mix-blend-overlay" />
    </div>
  );
};

export default BookingSuccess;
