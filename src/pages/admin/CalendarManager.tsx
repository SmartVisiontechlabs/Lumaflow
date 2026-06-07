import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  Unlock, 
  Clock, 
  X,
  AlertCircle
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  isBefore,
  startOfToday
} from 'date-fns';
import { adminSupabase as supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { Toast, ToastType } from '../../components/ui/Toast';

const CalendarManager = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [blockedDates, setBlockedDates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocking, setIsBlocking] = useState(false);
  const [reason, setReason] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  useEffect(() => {
    fetchBlockedDates();
  }, [currentMonth]);

  const fetchBlockedDates = async () => {
    setIsLoading(true);
    try {
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('blocked_slots')
        .select('*')
        .gte('blocked_date', start)
        .lte('blocked_date', end);
      
      if (error) {
        console.warn('Blocked slots table missing or unreachable:', error);
        return;
      }
      if (data) setBlockedDates(data);
    } catch (error) {
      console.error('Error fetching blocked dates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockDate = async () => {
    if (!selectedDate) return;
    setIsBlocking(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const timeRange = startTime ? (endTime ? `${startTime}-${endTime}` : startTime) : null;
      
      const { error } = await supabase
        .from('blocked_slots')
        .insert({
          blocked_date: dateStr,
          blocked_time: timeRange,
          reason: reason || 'Sanctuary maintenance',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      showToast('Sanctuary stillness manifested', 'success');
      fetchBlockedDates();
      setSelectedDate(null);
      setReason('');
      setStartTime('');
      setEndTime('');
    } catch (error) {
      console.error('Error blocking date:', error);
      showToast('Failed to block date', 'error');
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblockDate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blocked_slots')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      showToast('Sanctuary availability restored', 'success');
      fetchBlockedDates();
    } catch (error) {
      console.error('Error unblocking date:', error);
      showToast('Failed to restore availability', 'error');
    }
  };

  // Calendar Logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getBlockedForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return blockedDates.find(b => b.blocked_date === dateStr);
  };

  return (
    <div className="space-y-6 lg:space-y-12 min-h-full lg:h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 px-4 relative z-10">
        <div className="space-y-1">
          <h3 className="text-2xl font-display text-text-dark tracking-tight">Chronological Availability</h3>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 italic">Managing Sanctuary Stillness</p>
        </div>
        <div className="flex items-center gap-6 bg-white/40 backdrop-blur-xl border border-text-dark/5 p-2 rounded-2xl shadow-luxury">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-3 hover:bg-cream rounded-xl transition-all text-text-dark/40 hover:text-gold">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-text-dark px-4">{format(currentMonth, 'MMMM yyyy')}</span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-3 hover:bg-cream rounded-xl transition-all text-text-dark/40 hover:text-gold">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12 min-h-0">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white/40 backdrop-blur-xl border border-text-dark/5 rounded-[2rem] sm:rounded-[3rem] p-4 sm:p-12 shadow-luxury flex flex-col">
          <div className="grid grid-cols-7 mb-6 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <span key={day} className="text-[9px] font-bold uppercase tracking-wider sm:tracking-[0.4em] text-text-dark/20">{day}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-4 flex-1">
            {calendarDays.map((day, i) => {
              const blocked = getBlockedForDate(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isDisabled = !isSameMonth(day, monthStart) || isBefore(day, startOfToday());
              
              return (
                <motion.button
                  key={day.toString()}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.01 }}
                  onClick={() => !isDisabled && setSelectedDate(day)}
                  disabled={isDisabled}
                  className={cn(
                    "aspect-square rounded-xl sm:rounded-2xl p-1 sm:p-4 flex flex-col items-center justify-center relative transition-all duration-500 group border",
                    isSelected ? "bg-text-dark border-text-dark text-white shadow-luxury z-10" :
                    blocked ? "bg-red-50/50 border-red-100 text-red-400" :
                    isToday(day) ? "bg-gold/5 border-gold/20 text-gold" :
                    isDisabled ? "bg-transparent border-transparent text-text-dark/10" :
                    "bg-white/40 border-text-dark/5 text-text-dark/60 hover:bg-white hover:border-gold/30"
                  )}
                >
                  <span className="text-xs sm:text-sm font-bold tracking-tight">{format(day, 'd')}</span>
                  
                  {blocked && (
                    <div className="absolute top-1 right-1 sm:top-3 sm:right-3">
                      <Lock className="w-2 h-2 sm:w-2.5 sm:h-2.5 opacity-40" />
                    </div>
                  )}

                  {!isDisabled && !blocked && !isSelected && (
                    <div className="mt-1 sm:mt-2 w-1 h-1 bg-gold/20 rounded-full group-hover:bg-gold transition-all duration-500" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {selectedDate ? (
              <motion.div
                key="selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/40 backdrop-blur-xl border border-text-dark/5 rounded-[3rem] p-12 shadow-luxury space-y-8"
              >
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold/60 italic">Selected Date</p>
                  <h4 className="text-2xl font-display text-text-dark">{format(selectedDate, 'MMMM do, yyyy')}</h4>
                </div>

                {getBlockedForDate(selectedDate) ? (
                  <div className="space-y-8">
                    <div className="p-8 bg-red-50/50 border border-red-100 rounded-3xl space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-red-400">Date Blocked</p>
                      <p className="text-xs text-red-400/60 italic leading-relaxed">
                        “{getBlockedForDate(selectedDate).reason}”
                      </p>
                    </div>
                    <button
                      onClick={() => handleUnblockDate(getBlockedForDate(selectedDate).id)}
                      className="w-full py-6 bg-white border border-text-dark/5 text-text-dark text-[10px] font-bold uppercase tracking-[0.4em] rounded-2xl hover:bg-text-dark hover:text-white transition-all duration-700 shadow-sm"
                    >
                      Restore Availability
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-text-dark/20">Start (Optional)</p>
                        <input 
                          type="time" 
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full bg-white/50 border border-text-dark/5 p-4 rounded-xl text-xs focus:outline-none focus:border-gold/30 focus:bg-white transition-all duration-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-text-dark/20">End (Optional)</p>
                        <input 
                          type="time" 
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full bg-white/50 border border-text-dark/5 p-4 rounded-xl text-xs focus:outline-none focus:border-gold/30 focus:bg-white transition-all duration-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-text-dark/20">Reason for blocking</p>
                      <textarea 
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g. Personal Sabbatical, Maintenance..."
                        className="w-full bg-white/50 border border-text-dark/5 p-6 rounded-2xl text-xs focus:outline-none focus:border-gold/30 focus:bg-white transition-all duration-700 placeholder:text-text-dark/20 h-24 resize-none"
                      />
                    </div>
                    <button
                      onClick={handleBlockDate}
                      disabled={isBlocking}
                      className="w-full py-6 bg-text-dark text-white text-[10px] font-bold uppercase tracking-[0.4em] rounded-2xl hover:bg-gold transition-all duration-700 shadow-luxury flex items-center justify-center gap-3"
                    >
                      {isBlocking ? 'Blocking...' : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          Mark Unavailable
                        </>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-text-dark p-12 rounded-[3rem] shadow-luxury relative overflow-hidden group h-[400px] flex flex-col justify-end"
              >
                <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-gold/10 blur-[80px] rounded-full group-hover:bg-gold/20 transition-all duration-1000" />
                <div className="relative z-10 space-y-6">
                  <div className="p-5 bg-gold/10 rounded-2xl w-fit">
                    <CalendarIcon className="w-6 h-6 text-gold" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-display text-white tracking-tight italic">“Select a moment on the grid to manage its stillness.”</h4>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold/60">Operational Insight</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />
    </div>
  );
};

export default CalendarManager;
