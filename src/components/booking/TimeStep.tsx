import React, { memo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useBookingFlow } from '../../hooks/useBookingFlow';
import { Clock, Zap, ChevronLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format, parseISO, addDays } from 'date-fns';
import StepHeading from './shared/StepHeading';
import { getAvailableSlots } from '../../utils/bookingUtils';
import { bookingService } from '../../services/bookingService';
import { AvailabilitySlot } from '../../types/booking';

const formatTo12Hour = (time24: string): string => {
  if (!time24) return '';
  try {
    const [hoursStr, minutesStr] = time24.split(':');
    const hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHours.toString().padStart(2, '0')}:${minutesStr} ${ampm}`;
  } catch (e) {
    console.error('Error formatting 12-hour time:', e);
    return time24;
  }
};

const TimeStep = () => {
  const { 
    selectedTime, 
    setTime, 
    selectedDate, 
    setDate,
    selectedDuration,
    nextStep, 
    prevStep 
  } = useBookingFlow();

  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFindingNext, setIsFindingNext] = useState(false);
  const [nextDateInfo, setNextDateInfo] = useState<{ date: string; count: number } | null>(null);

  useEffect(() => {
    const fetchSlots = async () => {
      setIsLoading(true);
      setNextDateInfo(null);
      
      if (selectedDate) {
        console.log('[TimeStep] Fetching slots for date:', selectedDate, 'duration:', selectedDuration);
        const slots = await bookingService.getAvailability(selectedDate, selectedDuration);
        console.log('[TimeStep] Received slots:', slots);
        setAvailableSlots(slots);

        // FALLBACK: If no slots available, find the next available date
        if (slots.filter(s => s.isAvailable).length === 0) {
          setIsFindingNext(true);
          let checkDate = parseISO(selectedDate);
          let found = false;
          let attempts = 0;

          // Check next 14 days
          while (!found && attempts < 14) {
            checkDate = addDays(checkDate, 1);
            attempts++;
            const dateStr = format(checkDate, 'yyyy-MM-dd');
            const nextSlots = await bookingService.getAvailability(dateStr, selectedDuration);
            const availableCount = nextSlots.filter(s => s.isAvailable).length;
            
            if (availableCount > 0) {
              setNextDateInfo({ date: dateStr, count: availableCount });
              found = true;
            }
          }
          setIsFindingNext(false);
        }
      }
      setIsLoading(false);
    };

    fetchSlots();
  }, [selectedDate, selectedDuration]);

  const handleSelect = (timeEST: string) => {
    setTime(timeEST);
    setTimeout(nextStep, 600);
  };

  const parsedDate = selectedDate ? parseISO(selectedDate) : null;
  const userTimezone = typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';

  const availableCount = availableSlots.filter(s => s.isAvailable).length;

  return (
    <div className="max-w-5xl mx-auto">
      <StepHeading 
        tag="Availability"
        title={availableCount > 0 ? "Find your stillness" : "Sanctuary in Preparation"}
        subtitle={
          availableCount > 0 
            ? (parsedDate ? `Honoring your availability on ${format(parsedDate, 'EEEE, MMMM do')}.` : 'Choose the moment.')
            : "This specific moment is fully held. We invite you to explore the next opening."
        }
      />

      <div className="space-y-10">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-3 px-6 py-2.5 bg-gold/[0.03] border border-gold/10 rounded-full">
              <Clock className="w-3.5 h-3.5 text-gold/60" />
              <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold/60">Circadian Optimization</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-2.5 bg-text-dark/[0.03] border border-text-dark/5 rounded-full">
              <Zap className="w-3.5 h-3.5 text-gold/60" />
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-[0.4em]",
                availableCount > 0 ? "text-text-dark/30" : "text-red-400/60"
              )}>
                {availableCount} Rituals left
              </span>
            </div>
          </div>
          
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-dark/30 italic">
            Displaying in your local time ({userTimezone})
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full"
            />
          </div>
        ) : (
          <div className="space-y-12">
            {availableCount > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableSlots.map((slot, index) => (
                  <motion.button
                    key={slot.timeEST}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.05 }}
                    onClick={() => slot.isAvailable && handleSelect(slot.timeEST)}
                    disabled={!slot.isAvailable}
                    className={cn(
                      "group relative py-12 px-8 rounded-[3rem] border transition-all duration-700 backdrop-blur-md focus:outline-none overflow-hidden",
                      selectedTime === slot.timeEST
                        ? "bg-text-dark border-text-dark text-white shadow-luxury scale-[1.02]"
                        : slot.isAvailable 
                          ? "bg-white/40 border-text-dark/5 text-text-dark/60 hover:border-gold/30 hover:bg-white hover:text-text-dark"
                          : "bg-black/[0.02] border-transparent text-text-dark/10 grayscale cursor-not-allowed"
                    )}
                  >
                    <div className="flex flex-col items-center gap-5 relative z-10">
                      <Clock className={cn(
                        "w-5 h-5 transition-colors duration-700", 
                        selectedTime === slot.timeEST ? "text-gold" : "text-gold/30 group-hover:text-gold/60"
                      )} />
                      <div className="text-center">
                        <span className="text-3xl font-display tracking-tight block">
                          {formatTo12Hour(slot.timeEST)}
                        </span>
                        <span className="text-[10px] font-bold text-gold/60 uppercase tracking-widest mt-1 block">EST</span>
                        
                        {/* User Local Time Helper */}
                        <p className={cn(
                          "text-[9px] font-medium tracking-[0.1em] mt-3 opacity-40",
                          selectedTime === slot.timeEST ? "text-white/60" : "text-text-dark/40"
                        )}>
                          Local: {slot.timeLocal}
                        </p>

                        {!slot.isAvailable && (
                          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-red-400/60 mt-2 block">Reserved</span>
                        )}
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-30 group-hover:opacity-60 transition-opacity">
                        {slot.isAvailable ? 'Peak Resonance' : 'Session Full'}
                      </span>
                    </div>

                    {selectedTime === slot.timeEST && (
                      <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent pointer-events-none" />
                    )}
                  </motion.button>
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto"
              >
                {isFindingNext ? (
                  <div className="text-center py-12 space-y-4">
                    <motion.div 
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold/60"
                    >
                      Seeking next available moment...
                    </motion.div>
                  </div>
                ) : nextDateInfo ? (
                  <div className="bg-gold/[0.03] border border-gold/10 rounded-[3rem] p-12 text-center space-y-8 backdrop-blur-sm">
                    <div className="space-y-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.5em] text-gold/60">Next Opportunity</p>
                      <h4 className="font-display text-4xl text-text-dark">
                        {format(parseISO(nextDateInfo.date), 'EEEE, MMMM do')}
                      </h4>
                      <p className="text-sm text-text-dark/40 italic font-display">
                        “{nextDateInfo.count} ritual openings awaiting your presence.”
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setDate(nextDateInfo.date)}
                      className="px-12 py-5 bg-text-dark text-white rounded-full text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gold transition-all duration-700 shadow-luxury group"
                    >
                      Explore This Date
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-sm text-text-dark/40 italic font-display">
                      “The sanctuary is heavily held at this time. Please explore a different week.”
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        <div className="bg-white/30 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/40 text-center max-w-xl mx-auto shadow-luxury">
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold/60 mb-3">Custom Sanctuary Time?</p>
          <p className="text-sm text-text-dark/40 font-light italic leading-relaxed font-display">
            “Contact the sanctuary for highly specific chronological requirements.”
          </p>
        </div>
      </div>

      <button 
        onClick={prevStep}
        className="mt-12 mx-auto flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.4em] text-gold/30 hover:text-gold transition-all duration-700 focus:outline-none group cursor-pointer relative z-50"
      >
        <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
        Change Date
      </button>
    </div>
  );
};

export default memo(TimeStep);
