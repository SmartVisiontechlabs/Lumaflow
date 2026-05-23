import React, { useState, memo } from 'react';
import { useBookingFlow } from '../../hooks/useBookingFlow';
import { ChevronLeft, ChevronRight, ShieldCheck, Mail, User, MessageSquare, Sparkles, Calendar, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format, parseISO } from 'date-fns';
import StepHeading from './shared/StepHeading';
import { getLocalTimeForEST } from '../../utils/bookingUtils';

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

const DetailsStep = () => {
  const { 
    fullName, 
    email, 
    intentions, 
    setUserDetails,
    nextStep, 
    prevStep,
    selectedRitual,
    selectedDate,
    selectedTime,
    sessionFormat
  } = useBookingFlow();
  
  const [activeField, setActiveField] = useState<string | null>(null);

  const isFormValid = fullName.length > 2 && email.includes('@') && email.includes('.');

  const parsedDate = selectedDate ? parseISO(selectedDate) : null;

  return (
    <div className="max-w-4xl mx-auto">
      <StepHeading 
        tag="Connection"
        title="Finalize your ritual"
        subtitle="Share your details to secure your sanctuary."
      />

      <div className="space-y-8">
        {/* COMPACT SUMMARY CARD */}
        <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-[3rem] border border-gold/10 shadow-luxury grid grid-cols-1 md:grid-cols-3 gap-8 relative overflow-hidden">
          <div className="space-y-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold/60">Ritual</p>
            <div className="flex items-center gap-3 text-text-dark/80">
              <Sparkles className="w-4 h-4 text-gold/60" />
              <p className="text-sm font-semibold tracking-wide">{selectedRitual}</p>
            </div>
          </div>
          
          <div className="space-y-2 md:border-l border-gold/10 md:pl-8">
            <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold/60">Moment</p>
            <div className="flex flex-col gap-1 text-text-dark/80">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gold/60" />
                <p className="text-sm font-semibold tracking-wide">
                  {parsedDate && format(parsedDate, 'MMM do')} • {selectedTime && formatTo12Hour(selectedTime)} EST
                </p>
              </div>
              {selectedDate && selectedTime && (
                <p className="text-[10px] text-text-dark/40 italic pl-7">
                  Local: {getLocalTimeForEST(selectedDate, selectedTime)}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2 md:border-l border-gold/10 md:pl-8">
            <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold/60">Format</p>
            <div className="flex items-center gap-3 text-text-dark/80">
              <Clock className="w-4 h-4 text-gold/60" />
              <p className="text-sm font-semibold tracking-wide uppercase tracking-widest">{sessionFormat}</p>
            </div>
          </div>
        </div>

        {/* COMPACT FORM SECTION */}
        <div className="bg-white/50 backdrop-blur-md p-10 rounded-[3.5rem] border border-text-dark/5 space-y-8 relative shadow-luxury">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Full Name */}
            <div className="relative">
              <div className={cn(
                "absolute left-8 top-1/2 -translate-y-1/2 transition-colors duration-700",
                activeField === 'fullName' ? "text-gold" : "text-text-dark/10"
              )}>
                <User className="w-6 h-6" />
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
                  "peer w-full pl-20 pr-8 pt-9 pb-3.5 bg-white/40 border border-text-dark/5 rounded-[2rem] focus:outline-none focus:border-gold/30 focus:bg-white transition-all text-base font-light text-text-dark",
                  fullName && "border-gold/20"
                )}
              />
              <label className="absolute left-20 top-3 text-[10px] font-bold uppercase tracking-[0.4em] text-text-dark/30 transition-all duration-700 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-[10px]">
                Full Name
              </label>
            </div>

            {/* Email Address */}
            <div className="relative">
              <div className={cn(
                "absolute left-8 top-1/2 -translate-y-1/2 transition-colors duration-700",
                activeField === 'email' ? "text-gold" : "text-text-dark/10"
              )}>
                <Mail className="w-6 h-6" />
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
                  "peer w-full pl-20 pr-8 pt-9 pb-3.5 bg-white/40 border border-text-dark/5 rounded-[2rem] focus:outline-none focus:border-gold/30 focus:bg-white transition-all text-base font-light text-text-dark",
                  email && "border-gold/20"
                )}
              />
              <label className="absolute left-20 top-3 text-[10px] font-bold uppercase tracking-[0.4em] text-text-dark/30 transition-all duration-700 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-[10px]">
                Email Address
              </label>
            </div>
          </div>

          {/* Intentions */}
          <div className="relative">
            <div className={cn(
              "absolute left-8 top-10 transition-colors duration-700",
              activeField === 'intentions' ? "text-gold" : "text-text-dark/10"
            )}>
              <MessageSquare className="w-6 h-6" />
            </div>
            <textarea 
              placeholder=" "
              rows={4}
              value={intentions}
              onFocus={() => setActiveField('intentions')}
              onBlur={() => setActiveField(null)}
              onChange={(e) => setUserDetails({ intentions: e.target.value })}
              className={cn(
                "peer w-full pl-20 pr-10 pt-12 pb-6 bg-white/40 border border-text-dark/5 rounded-[2.5rem] focus:outline-none focus:border-gold/30 focus:bg-white transition-all text-base font-light text-text-dark resize-none leading-relaxed",
                intentions && "border-gold/20"
              )}
            />
            <label className="absolute left-20 top-5 text-[10px] font-bold uppercase tracking-[0.4em] text-text-dark/30 transition-all duration-700 peer-placeholder-shown:top-10 peer-placeholder-shown:text-sm peer-focus:top-5 peer-focus:text-[10px]">
              What is your primary intention?
            </label>
          </div>

          {/* COMPACT TRUST INDICATORS */}
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 pt-6 border-t border-text-dark/5">
            <div className="flex items-center gap-3 text-[9px] text-text-dark/30 uppercase tracking-[0.2em] italic font-display">
              <ShieldCheck className="w-4 h-4 text-gold/60" /> Divine Privacy
            </div>
            <div className="flex items-center gap-3 text-[9px] text-text-dark/30 uppercase tracking-[0.2em] italic font-display">
              <Sparkles className="w-4 h-4 text-gold/60" /> Intentionally Held
            </div>
            <div className="flex items-center gap-3 text-[9px] text-text-dark/30 uppercase tracking-[0.2em] italic font-display">
              <Mail className="w-4 h-4 text-gold/60" /> Portal Guide sent
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <button 
            disabled={!isFormValid}
            onClick={nextStep}
            className="flex-grow py-5 bg-text-dark text-white rounded-full text-[11px] font-bold uppercase tracking-[0.5em] shadow-luxury hover:bg-gold transition-all duration-700 disabled:opacity-20 disabled:grayscale focus:outline-none active:scale-[0.98] group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Confirm Ritual 
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>

        <button 
          onClick={prevStep}
          className="mt-8 mx-auto flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.4em] text-gold/30 hover:text-gold transition-all duration-700 focus:outline-none group cursor-pointer relative z-50"
        >
          <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          Review Schedule
        </button>
      </div>
    </div>
  );
};

export default memo(DetailsStep);
