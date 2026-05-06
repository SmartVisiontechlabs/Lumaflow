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
  startOfToday 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useBookingStore } from '../../store/bookingStore';
import { cn } from '../../lib/utils';
import SessionSummary from './shared/SessionSummary';

const CalendarStep = () => {
  const selectedDate = useBookingStore(state => state.selectedDate);
  const setDate = useBookingStore(state => state.setDate);
  const nextStep = useBookingStore(state => state.nextStep);
  const prevStep = useBookingStore(state => state.prevStep);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = startOfToday();

  const handleNextMonth = useCallback(() => setCurrentMonth(prev => addMonths(prev, 1)), []);
  const handlePrevMonth = useCallback(() => setCurrentMonth(prev => subMonths(prev, 1)), []);

  const onDateClick = (day: Date) => {
    if (isBefore(day, today)) return;
    setDate(day);
    setTimeout(nextStep, 500);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarRows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = day;
      const isDisabled = !isSameMonth(day, monthStart) || isBefore(day, today);
      const isSelected = selectedDate && isSameDay(day, selectedDate);
      const isToday = isSameDay(day, today);

      days.push(
        <button
          key={day.toString()}
          disabled={isDisabled}
          onClick={() => onDateClick(cloneDay)}
          className={cn(
            "relative aspect-square flex items-center justify-center rounded-2xl transition-all duration-500 text-xs font-light focus:outline-none",
            isDisabled ? "opacity-10 cursor-default" : "hover:bg-white hover:shadow-sm",
            isSelected ? "bg-gold text-white shadow-md font-bold" : "text-text-dark/60",
            isToday && !isSelected && "ring-1 ring-gold/20"
          )}
        >
          {format(day, 'd')}
        </button>
      );
      day = addDays(day, 1);
    }
    calendarRows.push(
      <div className="grid grid-cols-7 gap-1" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT PANEL: SUMMARY */}
        <div className="lg:col-span-5 space-y-8 bg-white/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/40 hidden lg:block">
          <SessionSummary />
          <div className="pt-8 border-t border-gold/10">
            <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-gold/60 mb-2">Notice</p>
            <p className="text-xs text-text-dark/40 font-light italic leading-relaxed">
              “Selecting your date begins the ritual. Each session is a sacred commitment.”
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: CALENDAR */}
        <div className="lg:col-span-7 w-full">
          <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-sm border border-white/20 relative overflow-hidden">
            <div className="flex items-center justify-between px-2 mb-8">
              <h3 className="font-display text-3xl text-text-dark">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <div className="flex gap-2">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gold/10 text-text-dark/30 hover:text-gold transition-all"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gold/10 text-text-dark/30 hover:text-gold transition-all"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 mb-4">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-center text-[8px] font-bold text-text-dark/20 uppercase tracking-widest">{d}</div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentMonth.toString()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-1"
              >
                {calendarRows}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 pt-6 border-t border-text-dark/5 flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-text-dark/20">
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-gold" /> Available</div>
              </div>
              <div className="flex items-center gap-2 italic">
                <CalendarIcon className="w-3 h-3" /> Local Time
              </div>
            </div>
          </div>
          
          <button 
            onClick={prevStep}
            className="mt-6 mx-auto flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 hover:text-gold transition-colors duration-500 focus:outline-none"
          >
            <ChevronLeft className="w-3 h-3" /> Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(CalendarStep);
