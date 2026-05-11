import React, { useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  isBefore, 
  startOfToday,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useBookingFlow } from '../../hooks/useBookingFlow';
import { cn } from '../../lib/utils';
import SessionSummary from './shared/SessionSummary';

const CalendarStep = () => {
  const { selectedDate, setDate, nextStep, prevStep } = useBookingFlow();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = startOfToday();

  const handleNextMonth = useCallback(() => setCurrentMonth(prev => addMonths(prev, 1)), []);
  const handlePrevMonth = useCallback(() => setCurrentMonth(prev => subMonths(prev, 1)), []);

  const onDateClick = (day: Date) => {
    if (isBefore(day, today)) return;
    setDate(format(day, 'yyyy-MM-dd'));
    setTimeout(nextStep, 600);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const parsedSelectedDate = selectedDate ? parseISO(selectedDate) : null;

  const calendarRows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = day;
      const isDisabled = !isSameMonth(day, monthStart) || isBefore(day, today);
      const isSelected = parsedSelectedDate && isSameDay(day, parsedSelectedDate);
      const isToday = isSameDay(day, today);

      days.push(
        <button
          key={day.toString()}
          disabled={isDisabled}
          onClick={() => onDateClick(cloneDay)}
          className={cn(
            "relative aspect-square flex items-center justify-center rounded-[1.25rem] transition-all duration-700 text-xs font-light focus:outline-none overflow-hidden",
            isDisabled ? "opacity-10 cursor-default" : "hover:bg-white hover:shadow-luxury group/day",
            isSelected ? "bg-text-dark text-white shadow-luxury font-bold" : "text-text-dark/60",
            isToday && !isSelected && "ring-1 ring-gold/30"
          )}
        >
          {isSelected && (
            <motion.div 
              layoutId="calendar-selection"
              className="absolute inset-0 bg-text-dark z-0"
            />
          )}
          <span className="relative z-10">{format(day, 'd')}</span>
          {!isDisabled && !isSelected && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold/0 group-hover/day:bg-gold/40 transition-colors" />
          )}
        </button>
      );
      day = addDays(day, 1);
    }
    calendarRows.push(
      <div className="grid grid-cols-7 gap-2" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* LEFT PANEL: SUMMARY */}
        <div className="lg:col-span-5 space-y-10 bg-white/40 backdrop-blur-2xl p-12 rounded-[3.5rem] border border-white/40 hidden lg:block shadow-luxury">
          <SessionSummary />
          <div className="pt-10 border-t border-gold/10">
            <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold/60 mb-3">Ritual Commitment</p>
            <p className="text-sm text-text-dark/40 font-light italic leading-relaxed font-display">
              “Selecting your date begins the sacred alignment. Each session is a commitment to your own transformation.”
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: CALENDAR */}
        <div className="lg:col-span-7 w-full">
          <div className="bg-white/80 backdrop-blur-3xl rounded-[3.5rem] p-10 shadow-luxury border border-white/30 relative overflow-hidden">
            <div className="flex items-center justify-between px-4 mb-10">
              <h3 className="font-display text-4xl text-text-dark tracking-tight">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <div className="flex gap-4">
                <button onClick={handlePrevMonth} className="p-3 rounded-full hover:bg-gold/10 text-text-dark/30 hover:text-gold transition-all"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={handleNextMonth} className="p-3 rounded-full hover:bg-gold/10 text-text-dark/30 hover:text-gold transition-all"><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 mb-6">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-center text-[10px] font-bold text-text-dark/20 uppercase tracking-[0.4em]">{d}</div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentMonth.toString()}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-2"
              >
                {calendarRows}
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 pt-8 border-t border-text-dark/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.4em] text-text-dark/20">
              <div className="flex gap-6">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gold/40" /> Available</div>
              </div>
              <div className="flex items-center gap-3 italic">
                <CalendarIcon className="w-4 h-4" /> local time
              </div>
            </div>
          </div>
          
          <button 
            onClick={prevStep}
            className="mt-10 mx-auto flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.4em] text-gold/30 hover:text-gold transition-all duration-700 focus:outline-none group cursor-pointer relative z-50"
          >
            <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Change Duration
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(CalendarStep);
