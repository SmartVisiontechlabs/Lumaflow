import React, { useState, memo } from 'react';
import { useBookingStore } from '../../store/bookingStore';
import { ChevronLeft, ChevronRight, ShieldCheck, Mail, User, MessageSquare, Sparkles, Calendar, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import StepHeading from './shared/StepHeading';

const DetailsStep = () => {
  const userDetails = useBookingStore(state => state.userDetails);
  const setUserDetails = useBookingStore(state => state.setUserDetails);
  const nextStep = useBookingStore(state => state.nextStep);
  const prevStep = useBookingStore(state => state.prevStep);
  const selectedSession = useBookingStore(state => state.selectedSession);
  const selectedDate = useBookingStore(state => state.selectedDate);
  const selectedTime = useBookingStore(state => state.selectedTime);
  const selectedFormat = useBookingStore(state => state.selectedFormat);
  
  const [activeField, setActiveField] = useState<string | null>(null);

  const isFormValid = userDetails.name.length > 2 && userDetails.email.includes('@') && userDetails.email.includes('.');

  return (
    <div className="max-w-3xl mx-auto">
      <StepHeading 
        tag="Connection"
        title="Finalize your ritual"
        subtitle="Share your details to secure your sanctuary."
      />

      <div className="space-y-6">
        {/* COMPACT SUMMARY CARD */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-gold/10 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden">
          <div className="space-y-1">
            <p className="text-[8px] font-bold uppercase tracking-widest text-gold/60">Session</p>
            <div className="flex items-center gap-2 text-text-dark/80">
              <Sparkles className="w-3 h-3 text-gold/60" />
              <p className="text-xs font-medium">{selectedSession?.name}</p>
            </div>
          </div>
          
          <div className="space-y-1 md:border-l border-gold/10 md:pl-6">
            <p className="text-[8px] font-bold uppercase tracking-widest text-gold/60">Moment</p>
            <div className="flex items-center gap-2 text-text-dark/80">
              <Calendar className="w-3 h-3 text-gold/60" />
              <p className="text-xs font-medium">
                {selectedDate && format(selectedDate, 'MMM do')} • {selectedTime}
              </p>
            </div>
          </div>

          <div className="space-y-1 md:border-l border-gold/10 md:pl-6">
            <p className="text-[8px] font-bold uppercase tracking-widest text-gold/60">Format</p>
            <div className="flex items-center gap-2 text-text-dark/80">
              <Clock className="w-3 h-3 text-gold/60" />
              <p className="text-xs font-medium">{selectedFormat}</p>
            </div>
          </div>
        </div>

        {/* COMPACT FORM SECTION */}
        <div className="bg-white/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-text-dark/5 space-y-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="relative">
              <div className={cn(
                "absolute left-6 top-1/2 -translate-y-1/2 transition-colors duration-500",
                activeField === 'name' ? "text-gold" : "text-text-dark/10"
              )}>
                <User className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                placeholder=" "
                autoComplete="name"
                value={userDetails.name}
                onFocus={() => setActiveField('name')}
                onBlur={() => setActiveField(null)}
                onChange={(e) => setUserDetails({ name: e.target.value })}
                className={cn(
                  "peer w-full pl-16 pr-8 pt-8 pb-3 bg-white/40 border border-text-dark/5 rounded-2xl focus:outline-none focus:border-gold/30 focus:bg-white transition-all text-base font-light text-text-dark",
                  userDetails.name && "border-gold/20"
                )}
              />
              <label className="absolute left-16 top-3 text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/30 transition-all duration-500 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-[9px]">
                Full Name
              </label>
            </div>

            {/* Email Address */}
            <div className="relative">
              <div className={cn(
                "absolute left-6 top-1/2 -translate-y-1/2 transition-colors duration-500",
                activeField === 'email' ? "text-gold" : "text-text-dark/10"
              )}>
                <Mail className="w-5 h-5" />
              </div>
              <input 
                type="email" 
                placeholder=" "
                autoComplete="email"
                value={userDetails.email}
                onFocus={() => setActiveField('email')}
                onBlur={() => setActiveField(null)}
                onChange={(e) => setUserDetails({ email: e.target.value })}
                className={cn(
                  "peer w-full pl-16 pr-8 pt-8 pb-3 bg-white/40 border border-text-dark/5 rounded-2xl focus:outline-none focus:border-gold/30 focus:bg-white transition-all text-base font-light text-text-dark",
                  userDetails.email && "border-gold/20"
                )}
              />
              <label className="absolute left-16 top-3 text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/30 transition-all duration-500 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-[9px]">
                Email Address
              </label>
            </div>
          </div>

          {/* Intentions */}
          <div className="relative">
            <div className={cn(
              "absolute left-6 top-8 transition-colors duration-500",
              activeField === 'intentions' ? "text-gold" : "text-text-dark/10"
            )}>
              <MessageSquare className="w-5 h-5" />
            </div>
            <textarea 
              placeholder=" "
              rows={3}
              value={userDetails.intentions}
              onFocus={() => setActiveField('intentions')}
              onBlur={() => setActiveField(null)}
              onChange={(e) => setUserDetails({ intentions: e.target.value })}
              className={cn(
                "peer w-full pl-16 pr-8 pt-10 pb-4 bg-white/40 border border-text-dark/5 rounded-[1.5rem] focus:outline-none focus:border-gold/30 focus:bg-white transition-all text-base font-light text-text-dark resize-none",
                userDetails.intentions && "border-gold/20"
              )}
            />
            <label className="absolute left-16 top-4 text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/30 transition-all duration-500 peer-placeholder-shown:top-8 peer-placeholder-shown:text-xs peer-focus:top-4 peer-focus:text-[9px]">
              Intentions
            </label>
          </div>

          {/* COMPACT TRUST INDICATORS */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 pt-4 border-t border-text-dark/5">
            <div className="flex items-center gap-2 text-[8px] text-text-dark/30 uppercase tracking-[0.1em] italic">
              <ShieldCheck className="w-3 h-3 text-gold/60" /> Private
            </div>
            <div className="flex items-center gap-2 text-[8px] text-text-dark/30 uppercase tracking-[0.1em] italic">
              <Sparkles className="w-3 h-3 text-gold/60" /> Intentional
            </div>
            <div className="flex items-center gap-2 text-[8px] text-text-dark/30 uppercase tracking-[0.1em] italic">
              <Mail className="w-3 h-3 text-gold/60" /> Guide sent
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={prevStep}
            className="px-10 py-4 bg-white/40 border border-text-dark/5 text-text-dark/40 rounded-full text-[9px] font-bold uppercase tracking-[0.3em] hover:border-gold/40 hover:text-gold transition-all duration-500 focus:outline-none"
          >
            <ChevronLeft className="inline-block w-3 h-3 mr-1" /> Back
          </button>
          <button 
            disabled={!isFormValid}
            onClick={nextStep}
            className="flex-grow py-4 bg-text-dark text-white rounded-full text-[10px] font-bold uppercase tracking-[0.4em] shadow-lg hover:bg-gold transition-all duration-500 disabled:opacity-20 disabled:grayscale focus:outline-none active:scale-95"
          >
            Confirm Ritual <ChevronRight className="inline-block w-3 h-3 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(DetailsStep);
