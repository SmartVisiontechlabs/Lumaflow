import React from 'react';
import { motion } from 'framer-motion';
import { useBookingFlow } from '../../../hooks/useBookingFlow';
import { Sparkles, Calendar, Clock, Heart } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { getLocalTimeForEST } from '../../../utils/bookingUtils';

const formatTo12Hour = (time24: string): string => {
  if (!time24) return '';
  try {
    const [hoursStr, minutesStr] = time24.split(':');
    const hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHours.toString().padStart(2, '0')}:${minutesStr} ${ampm}`;
  } catch (e) {
    return time24;
  }
};

export default function SessionSummary() {
  const { 
    emotionalState, 
    selectedRitual, 
    sessionFormat, 
    selectedDuration,
    selectedDate,
    selectedTime
  } = useBookingFlow();

  if (!emotionalState) return null;

  const parsedDate = selectedDate ? parseISO(selectedDate) : null;

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-gold/60">Ritual Summary</p>
        <h3 className="font-display text-4xl text-text-dark leading-tight italic">
          “You’re creating space to reconnect with your center.”
        </h3>
      </div>

      <div className="space-y-10">
        {/* Emotion Section */}
        <div className="flex items-center gap-6 group">
          <div className="w-14 h-14 bg-gold/10 rounded-full flex items-center justify-center text-gold group-hover:scale-110 transition-transform duration-1000 border border-gold/5">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold/60 mb-1.5">Internal State</p>
            <p className="text-lg text-text-dark font-light tracking-wide">{emotionalState}</p>
          </div>
        </div>

        {/* Ritual Section */}
        {selectedRitual && (
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-6 group"
          >
            <div className="w-14 h-14 bg-gold/10 rounded-full flex items-center justify-center text-gold group-hover:scale-110 transition-transform duration-1000 border border-gold/5">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold/60 mb-1.5">Healing Path</p>
              <p className="text-lg text-text-dark font-light tracking-wide">{selectedRitual}</p>
            </div>
          </motion.div>
        )}

        {/* Format & Duration */}
        {(sessionFormat || selectedDuration) && (
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex items-center gap-6 group"
          >
            <div className="w-14 h-14 bg-gold/10 rounded-full flex items-center justify-center text-gold group-hover:scale-110 transition-transform duration-1000 border border-gold/5">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold/60 mb-1.5">The Container</p>
              <p className="text-lg text-text-dark font-light tracking-wide">
                {[sessionFormat, `${selectedDuration}m`].filter(Boolean).join(' • ')}
              </p>
            </div>
          </motion.div>
        )}

        {/* Date & Time */}
        {(selectedDate || selectedTime) && (
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center gap-6 group"
          >
            <div className="w-14 h-14 bg-gold/10 rounded-full flex items-center justify-center text-gold group-hover:scale-110 transition-transform duration-1000 border border-gold/5">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold/60 mb-1.5">Scheduled Moment</p>
              <p className="text-lg text-text-dark font-light tracking-wide">
                {parsedDate ? format(parsedDate, 'MMMM do, yyyy') : ''}
                {selectedTime ? ` at ${formatTo12Hour(selectedTime)} EST` : ''}
              </p>
              {selectedDate && selectedTime && (
                <p className="text-[10px] text-text-dark/30 italic">
                  Local: {getLocalTimeForEST(selectedDate, selectedTime)}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Trust Trigger */}
      <div className="pt-10 border-t border-gold/10">
        <p className="text-[10px] text-text-dark/30 uppercase tracking-[0.3em] italic font-display">
          “Safely held by the LumaFlow guide network”
        </p>
      </div>
    </div>
  );
}
