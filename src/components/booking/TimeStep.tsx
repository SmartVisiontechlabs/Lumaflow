import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useBookingStore } from '../../store/bookingStore';
import { ChevronLeft, Clock, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import StepHeading from './shared/StepHeading';

const timeSlots = [
  '10:00 AM',
  '11:30 AM',
  '02:00 PM',
  '05:00 PM',
  '07:30 PM'
];

const TimeStep = () => {
  const selectedTime = useBookingStore(state => state.selectedTime);
  const setTime = useBookingStore(state => state.setTime);
  const selectedDate = useBookingStore(state => state.selectedDate);
  const nextStep = useBookingStore(state => state.nextStep);
  const prevStep = useBookingStore(state => state.prevStep);

  const handleSelect = (time: string) => {
    setTime(time);
    setTimeout(nextStep, 500);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <StepHeading 
        tag="Availability"
        title="Find your stillness"
        subtitle={selectedDate ? `Honoring your availability on ${format(selectedDate, 'EEEE, MMMM do')}.` : 'Choose the moment.'}
      />

      <div className="space-y-8">
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-gold/5 border border-gold/10 rounded-full">
            <Clock className="w-3 h-3 text-gold/60" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-gold/60">Mostly Evening</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-text-dark/5 border border-text-dark/5 rounded-full">
            <Zap className="w-3 h-3 text-gold/60" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-text-dark/30">2 Slots left</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {timeSlots.map((time, index) => (
            <motion.button
              key={time}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              onClick={() => handleSelect(time)}
              className={cn(
                "group relative py-8 px-6 rounded-[2rem] border transition-all duration-500 backdrop-blur-sm focus:outline-none",
                selectedTime === time
                  ? "bg-text-dark border-text-dark text-white shadow-lg"
                  : "bg-white/40 border-text-dark/5 text-text-dark/60 hover:border-gold/30 hover:bg-white"
              )}
            >
              <div className="flex flex-col items-center gap-3">
                <Clock className={cn("w-4 h-4", selectedTime === time ? "text-gold" : "text-gold/30")} />
                <span className="text-2xl font-display tracking-tight">{time}</span>
                <span className="text-[8px] font-bold uppercase tracking-[0.1em] opacity-40">Optimal recovery</span>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="bg-white/30 backdrop-blur-sm p-6 rounded-3xl border border-white/40 text-center max-w-xl mx-auto">
          <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-gold/60 mb-2">Private Session?</p>
          <p className="text-xs text-text-dark/40 font-light italic leading-relaxed">
            “Contact our sanctuary for custom availability.”
          </p>
        </div>
      </div>

      <button 
        onClick={prevStep}
        className="mt-8 mx-auto flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 hover:text-gold transition-colors duration-500 focus:outline-none"
      >
        <ChevronLeft className="w-3 h-3" /> Back
      </button>
    </div>
  );
};

export default memo(TimeStep);
