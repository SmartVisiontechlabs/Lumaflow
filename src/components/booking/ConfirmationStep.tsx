import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../store/bookingStore';
import { CheckCircle2, Sparkles, Home, Search, Clock, MapPin, Calendar, Mail } from 'lucide-react';
import { format } from 'date-fns';

const ConfirmationStep = () => {
  const selectedSession = useBookingStore(state => state.selectedSession);
  const selectedDate = useBookingStore(state => state.selectedDate);
  const selectedTime = useBookingStore(state => state.selectedTime);
  const selectedFormat = useBookingStore(state => state.selectedFormat);
  const userDetails = useBookingStore(state => state.userDetails);
  const resetBooking = useBookingStore(state => state.resetBooking);
  const closeBooking = useBookingStore(state => state.closeBooking);
  
  const navigate = useNavigate();

  const handleFinish = (path: string) => {
    resetBooking();
    closeBooking();
    navigate(path);
  };

  return (
    <div className="relative min-h-[60vh] flex items-center justify-center py-10 px-4 overflow-hidden">
      {/* IMMERSIVE BACKGROUND EFFECTS - Simplified for production performance */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ 
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-3xl w-full text-center space-y-12"
      >
        <div className="space-y-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative w-24 h-24 mx-auto"
          >
            <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl animate-pulse" />
            <div className="relative w-full h-full bg-gold rounded-full flex items-center justify-center shadow-lg border border-white/20">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          
          <div className="space-y-4">
            <h2 className="font-display text-4xl md:text-6xl text-text-dark">
              Your sanctuary <br />
              <span className="italic text-gold">has been reserved</span>
            </h2>
            <p className="text-text-dark/40 font-light text-lg italic max-w-md mx-auto leading-relaxed">
              “A gentle confirmation has been prepared. We look forward to meeting you.”
            </p>
          </div>
        </div>

        {/* BOOKING SUMMARY CARD */}
        <div className="bg-white/60 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] p-10 shadow-sm text-left grid grid-cols-1 md:grid-cols-2 gap-8 relative overflow-hidden">
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-gold/60">Healing Path</p>
              <p className="font-display text-2xl text-text-dark">{selectedSession?.name}</p>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-text-dark/60">
                <MapPin className="w-4 h-4 text-gold/60" />
                <span className="text-sm font-light">{selectedFormat}</span>
              </div>
              <div className="flex items-center gap-3 text-text-dark/60">
                <Mail className="w-4 h-4 text-gold/60" />
                <span className="text-sm font-light">{userDetails.email}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6 md:border-l border-gold/10 md:pl-10">
            <div className="space-y-1">
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-gold/60">Appointed Moment</p>
              <p className="font-display text-2xl text-text-dark">
                {selectedDate && format(selectedDate, 'MMM do, yyyy')}
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-text-dark/60">
                <Calendar className="w-4 h-4 text-gold/60" />
                <span className="text-sm font-light">Preparation guide sent</span>
              </div>
              <div className="flex items-center gap-3 text-text-dark/60">
                <Clock className="w-4 h-4 text-gold/60" />
                <span className="text-sm font-bold text-gold uppercase tracking-widest">{selectedTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button 
            onClick={() => handleFinish('/')}
            className="px-10 py-5 bg-text-dark text-white rounded-full text-[10px] font-bold uppercase tracking-[0.3em] shadow-md hover:bg-gold transition-all duration-500 active:scale-95"
          >
            <Home className="inline-block w-3 h-3 mr-2 mb-0.5" /> Home
          </button>
          <button 
            onClick={() => handleFinish('/classes')}
            className="px-10 py-5 bg-white/40 border border-text-dark/5 text-text-dark/40 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:border-gold/40 hover:text-gold transition-all duration-500 active:scale-95"
          >
            <Search className="inline-block w-3 h-3 mr-2 mb-0.5" /> Programs
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-[8px] text-gold/60 font-bold uppercase tracking-[0.3em]">
          <Sparkles className="w-3 h-3" /> Sacred confirmation sent to inbox
        </div>
      </motion.div>
    </div>
  );
};

export default memo(ConfirmationStep);
