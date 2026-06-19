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
import { supabase } from '../../lib/supabase';
import { trackWaitlistJoin } from '../../lib/analytics';

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
    prevStep,
    selectedRitual
  } = useBookingFlow();

  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFindingNext, setIsFindingNext] = useState(false);
  const [nextDateInfo, setNextDateInfo] = useState<{ date: string; count: number } | null>(null);

  // Waitlist States
  const [waitlistName, setWaitlistName] = useState('');
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistPrefTime, setWaitlistPrefTime] = useState('Any Time');
  const [waitlistSubmitStatus, setWaitlistSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [waitlistError, setWaitlistError] = useState('');

  // Prefill logged in user info
  useEffect(() => {
    const prefillUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setWaitlistEmail(session.user.email || '');
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .single();
          if (profile?.full_name) {
            setWaitlistName(profile.full_name);
          }
        }
      } catch (e) {
        console.error('Error prefilling waitlist user:', e);
      }
    };
    prefillUser();
  }, []);

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistName || !waitlistEmail) {
      setWaitlistError('Name and email are required');
      return;
    }
    setWaitlistSubmitStatus('submitting');
    setWaitlistError('');
    try {
      const { error } = await supabase.from('waitlist_entries').insert({
        name: waitlistName,
        email: waitlistEmail,
        preferred_date: selectedDate,
        preferred_time: waitlistPrefTime,
      });

      if (error) {
        throw new Error(error.message);
      }

      setWaitlistSubmitStatus('success');
      trackWaitlistJoin(selectedDate, waitlistPrefTime, selectedRitual || 'Somatic Session');
    } catch (err: any) {
      console.error('[TimeStep] Waitlist submission error:', err);
      setWaitlistError(err.message || 'Failed to join waitlist. Please try again.');
      setWaitlistSubmitStatus('error');
    }
  };

  useEffect(() => {
    const fetchSlots = async () => {
      setIsLoading(true);
      setNextDateInfo(null);
      
      if (selectedDate) {
        console.log('[TimeStep] Fetching slots for date:', selectedDate, 'duration:', selectedDuration);
        const slots = await bookingService.getAvailability(selectedDate, selectedDuration);
        console.log('[TimeStep] Received slots:', slots);
        console.log('[TimeStep] Loaded available slots:', slots);
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
    <div className="w-full">
      <StepHeading 
        tag="Availability"
        title={availableCount > 0 ? "Find your stillness" : "Sanctuary in Preparation"}
        subtitle={
          availableCount > 0 
            ? (parsedDate ? `Honoring your availability on ${format(parsedDate, 'EEEE, MMMM do')}.` : 'Choose the moment.')
            : "This specific moment is fully held. We invite you to explore the next opening."
        }
      />

      <div className="space-y-6">
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
          
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-dark/30 italic text-center">
            All times are based in New York Sanctuary time (EDT/EST) and translated to your local time ({userTimezone})
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
              <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-8">
                {availableSlots.map((slot, index) => (
                  <motion.button
                    key={slot.timeEST}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.05 }}
                    onClick={() => slot.isAvailable && handleSelect(slot.timeEST)}
                    disabled={!slot.isAvailable}
                    whileHover={slot.isAvailable ? {
                      y: -5,
                      scale: 1.015,
                      boxShadow: '0 20px 40px -10px rgba(203, 174, 115, 0.12)',
                    } : {}}
                    whileTap={slot.isAvailable ? { scale: 0.99 } : {}}
                    className={cn(
                      "group relative p-4 rounded-[1.5rem] border transition-all duration-700 backdrop-blur-md focus:outline-none text-left flex flex-col justify-between w-[300px] h-[140px] overflow-hidden cursor-pointer",
                      selectedTime === slot.timeEST
                        ? "bg-text-dark border-text-dark text-white shadow-luxury"
                        : slot.isAvailable 
                          ? "bg-white/50 border-gold/10 text-text-dark hover:border-gold/30 hover:bg-white"
                          : "bg-black/[0.02] border-transparent text-text-dark/20 grayscale cursor-not-allowed"
                    )}
                  >
                    {/* Top Row: Circadian Label & Clock */}
                    <div className="w-full flex justify-between items-center">
                      <span className={cn(
                        "text-[7px] font-bold uppercase tracking-[0.25em] px-2 py-0.5 rounded-full border transition-colors duration-700",
                        selectedTime === slot.timeEST 
                          ? "bg-white/10 border-white/20 text-gold" 
                          : "bg-gold/5 border-gold/10 text-gold"
                      )}>
                        Circadian Resonance
                      </span>
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-700",
                        selectedTime === slot.timeEST 
                          ? "bg-gold border-gold text-white" 
                          : slot.isAvailable 
                            ? "bg-gold/5 border-gold/10 text-gold group-hover:bg-gold/10" 
                            : "bg-black/5 border-transparent text-text-dark/20"
                      )}>
                        <Clock className="w-3 h-3" />
                      </div>
                    </div>

                    {/* Middle: Time Selection Info */}
                    <div className="space-y-0.5">
                      <span className={cn(
                        "text-2xl font-display tracking-tight block transition-colors duration-700",
                        selectedTime === slot.timeEST ? "text-white" : "text-text-dark"
                      )}>
                        {slot.timeESTLabel || formatTo12Hour(slot.timeEST)}
                      </span>
                      {slot.timeLocalLabel && slot.timeLocalLabel !== slot.timeESTLabel && (
                        <span className={cn(
                          "text-xs font-light block transition-colors duration-700",
                          selectedTime === slot.timeEST ? "text-white/70" : "text-gold"
                        )}>
                          Local: {slot.timeLocalLabel}
                        </span>
                      )}
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-[9px] font-light transition-colors duration-700",
                          selectedTime === slot.timeEST ? "text-white/60" : "text-text-dark/40"
                        )}>
                          {selectedDuration}m Ritual
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row: Availability Status */}
                    <div 
                      className="w-full pt-2 border-t border-dashed flex items-center justify-between transition-colors duration-700"
                      style={{ borderColor: selectedTime === slot.timeEST ? 'rgba(255,255,255,0.1)' : 'rgba(203,174,115,0.15)' }}
                    >
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-[0.25em] transition-colors duration-700",
                        selectedTime === slot.timeEST 
                          ? "text-gold" 
                          : slot.isAvailable 
                            ? "text-gold/80" 
                            : "text-red-400/60"
                      )}>
                        {slot.isAvailable ? 'Available' : 'Reserved'}
                      </span>
                      
                      <span className={cn(
                        "text-[8px] font-bold uppercase tracking-[0.2em] opacity-30 group-hover:opacity-60 transition-opacity transition-colors duration-700",
                        selectedTime === slot.timeEST ? "text-white" : "text-text-dark"
                      )}>
                        {slot.isAvailable ? 'Select' : 'Held'}
                      </span>
                    </div>

                    {/* Luminous Bloom effects */}
                    {selectedTime === slot.timeEST && (
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gold/15 blur-[35px] rounded-full -mr-8 -mt-8 pointer-events-none" />
                    )}
                    {slot.isAvailable && selectedTime !== slot.timeEST && (
                      <div className="absolute top-0 right-0 w-14 h-14 bg-gold/5 blur-[25px] rounded-full -mr-7 -mt-7 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    )}
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="space-y-8 max-w-xl mx-auto">
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
                ) : (
                  <>
                    {nextDateInfo && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gold/[0.03] border border-gold/10 rounded-[2rem] p-6 text-center space-y-4 backdrop-blur-sm"
                      >
                        <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold/60">Next Opportunity</p>
                        <h4 className="font-display text-xl text-text-dark">
                          {format(parseISO(nextDateInfo.date), 'EEEE, MMMM do')}
                        </h4>
                        <button
                          onClick={() => setDate(nextDateInfo.date)}
                          className="px-8 py-3 bg-text-dark text-white rounded-full text-[9px] font-bold uppercase tracking-[0.4em] hover:bg-gold transition-all duration-700 shadow-luxury cursor-pointer"
                        >
                          Explore This Date
                        </button>
                      </motion.div>
                    )}
                    
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/40 backdrop-blur-md border border-gold/15 rounded-[2.5rem] p-8 shadow-luxury space-y-6"
                    >
                      <div className="text-center space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">Ritual Full</p>
                        <h3 className="font-display text-2xl text-text-dark">Join the Waitlist</h3>
                        <p className="text-xs text-text-dark/50 font-light max-w-sm mx-auto">
                          This date is fully booked. Share your details to be notified immediately of any ritual cancellations.
                        </p>
                      </div>
                      
                      {waitlistSubmitStatus === 'success' ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-center py-6 space-y-4"
                        >
                          <div className="w-12 h-12 bg-gold/10 border border-gold/20 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">Resonance Registered</p>
                            <p className="text-xs text-text-dark/60 font-light">
                              We will contact you at <strong className="font-semibold text-text-dark">{waitlistEmail}</strong> if an opening occurs.
                            </p>
                          </div>
                        </motion.div>
                      ) : (
                        <form onSubmit={handleJoinWaitlist} className="space-y-4">
                          <div className="grid grid-cols-1 gap-3">
                            <input
                              type="text"
                              placeholder="What should we call you?"
                              value={waitlistName}
                              onChange={(e) => setWaitlistName(e.target.value)}
                              className="w-full px-6 py-4 bg-white/40 border border-[#3A3A3A]/10 rounded-full focus:outline-none focus:border-gold/50 focus:bg-white transition-all text-xs font-light tracking-wide text-text-dark"
                              required
                            />
                            <input
                              type="email"
                              placeholder="Where can we reach you?"
                              value={waitlistEmail}
                              onChange={(e) => setWaitlistEmail(e.target.value)}
                              className="w-full px-6 py-4 bg-white/40 border border-[#3A3A3A]/10 rounded-full focus:outline-none focus:border-gold/50 focus:bg-white transition-all text-xs font-light tracking-wide text-text-dark"
                              required
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={parsedDate ? format(parsedDate, 'MMMM do, yyyy') : ''}
                                  disabled
                                  className="w-full px-6 py-4 bg-black/[0.03] border border-transparent rounded-full text-xs font-light tracking-wide text-text-dark/40 cursor-not-allowed"
                                />
                              </div>
                              <div className="relative">
                                <select
                                  value={waitlistPrefTime}
                                  onChange={(e) => setWaitlistPrefTime(e.target.value)}
                                  className="w-full px-6 py-4 bg-white/40 border border-[#3A3A3A]/10 rounded-full focus:outline-none focus:border-gold/50 focus:bg-white transition-all text-xs font-light tracking-wide text-text-dark appearance-none cursor-pointer"
                                >
                                  <option value="Any Time">Any Time</option>
                                  <option value="Morning (8am - 12pm)">Morning (8am - 12pm)</option>
                                  <option value="Afternoon (12pm - 4pm)">Afternoon (12pm - 4pm)</option>
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-text-dark/40">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>

                          {waitlistError && (
                            <p className="text-[10px] text-red-500/80 font-bold uppercase tracking-wider text-center">
                              {waitlistError}
                            </p>
                          )}

                          <motion.button
                            type="submit"
                            disabled={waitlistSubmitStatus === 'submitting'}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="w-full py-4 bg-text-dark text-white rounded-full text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gold transition-all duration-700 shadow-luxury disabled:opacity-50 cursor-pointer"
                          >
                            {waitlistSubmitStatus === 'submitting' ? 'Registering Resonance...' : 'Request Alignment'}
                          </motion.button>
                        </form>
                      )}
                    </motion.div>
                  </>
                )}
              </div>
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
