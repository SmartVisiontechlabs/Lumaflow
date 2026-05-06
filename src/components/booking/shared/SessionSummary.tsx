import React from 'react';
import { motion } from 'framer-motion';
import { useBookingStore } from '../../../store/bookingStore';
import { Sparkles, Calendar, Clock, Heart } from 'lucide-react';
import { format } from 'date-fns';

export default function SessionSummary() {
  const { 
    selectedEmotion, 
    selectedSession, 
    selectedFormat, 
    selectedDuration,
    selectedDate,
    selectedTime
  } = useBookingStore();

  if (!selectedEmotion) return null;

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold/60">Your Ritual Summary</p>
        <h3 className="font-display text-4xl text-text-dark leading-tight italic">
          “You’re creating space to reconnect with yourself.”
        </h3>
      </div>

      <div className="space-y-8">
        {/* Emotion Section */}
        <div className="flex items-center gap-5 group">
          <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center text-gold group-hover:scale-110 transition-transform duration-700">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-gold/60 mb-1">Honoring your feeling</p>
            <p className="text-base text-text-dark font-light">{selectedEmotion}</p>
          </div>
        </div>

        {/* Session Section */}
        {selectedSession && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-5 group"
          >
            <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center text-gold group-hover:scale-110 transition-transform duration-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-gold/60 mb-1">Recommended Path</p>
              <p className="text-base text-text-dark font-light">{selectedSession.name}</p>
            </div>
          </motion.div>
        )}

        {/* Format & Duration */}
        {(selectedFormat || selectedDuration) && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-5 group"
          >
            <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center text-gold group-hover:scale-110 transition-transform duration-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-gold/60 mb-1">Experience Details</p>
              <p className="text-base text-text-dark font-light">
                {[selectedFormat, selectedDuration].filter(Boolean).join(' • ')}
              </p>
            </div>
          </motion.div>
        )}

        {/* Date & Time */}
        {(selectedDate || selectedTime) && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-5 group"
          >
            <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center text-gold group-hover:scale-110 transition-transform duration-700">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-gold/60 mb-1">Scheduled Moment</p>
              <p className="text-base text-text-dark font-light">
                {selectedDate ? format(selectedDate, 'MMMM do, yyyy') : ''}
                {selectedTime ? ` at ${selectedTime}` : ''}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Trust Trigger */}
      <div className="pt-10 border-t border-gold/10">
        <p className="text-[9px] text-text-dark/40 uppercase tracking-[0.2em] italic">
          “Trusted by 100+ healing journeys”
        </p>
      </div>
    </div>
  );
}
