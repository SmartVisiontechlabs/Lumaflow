import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, 
  Mail, 
  Calendar, 
  Clock, 
  User, 
  Bell, 
  Trash2, 
  Search,
  CheckCircle2
} from 'lucide-react';
import { adminSupabase as supabase } from '../../lib/supabase';
import { format, parseISO } from 'date-fns';
import { cn } from '../../lib/utils';
import { Skeleton } from '../../components/ui/Skeleton';
import { Toast, ToastType } from '../../components/ui/Toast';

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  preferred_date: string;
  preferred_time: string;
  notified: boolean;
  created_at: string;
}

const WaitlistManager = () => {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const fetchWaitlist = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const headers = { 'Authorization': `Bearer ${session.access_token}` };
      const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';
      const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

      const response = await fetch(`${API_URL}/admin/waitlist`, { headers });
      if (!response.ok) {
        throw new Error('Failed to fetch waitlist entries');
      }
      const data = await response.json();
      setEntries(data || []);
    } catch (error: any) {
      console.error('Error fetching waitlist:', error);
      showToast(error.message || 'Failed to retrieve sanctuary waitlist entries', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const handleNotify = async (id: string) => {
    setIsSubmitting(id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';
      const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

      const response = await fetch(`${API_URL}/admin/waitlist/${id}/notify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to notify waitlisted client');
      }

      showToast('Client notified of available opening successfully', 'success');
      await fetchWaitlist();
    } catch (err: any) {
      console.error('Error notifying client:', err);
      showToast(err.message || 'Failed to notify client', 'error');
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this waitlist entry?')) {
      return;
    }
    setIsSubmitting(id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';
      const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

      const response = await fetch(`${API_URL}/admin/waitlist/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove waitlist entry');
      }

      showToast('Waitlist entry removed successfully', 'success');
      await fetchWaitlist();
    } catch (err: any) {
      console.error('Error removing entry:', err);
      showToast(err.message || 'Failed to remove waitlist entry', 'error');
    } finally {
      setIsSubmitting(null);
    }
  };

  const filteredEntries = entries.filter(entry => 
    entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.preferred_date.includes(searchTerm)
  );

  return (
    <div className="space-y-6 lg:space-y-12 h-full flex flex-col">
      {/* Header Actions */}
      <div className="flex justify-between items-center px-4 relative z-10">
        <div className="relative w-full max-w-[400px] group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-text-dark/20 group-focus-within:text-gold transition-colors duration-500" />
          </div>
          <input 
            type="text"
            placeholder="Search Waitlist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/40 backdrop-blur-xl border border-text-dark/5 py-5 pl-14 pr-6 rounded-2xl text-xs uppercase tracking-widest focus:outline-none focus:border-gold/30 focus:bg-white transition-all duration-700 placeholder:text-text-dark/20 text-text-dark font-sans"
          />
        </div>
        <div className="flex items-center gap-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-text-dark/20 italic">Total Waitlisted: {entries.length}</p>
        </div>
      </div>

      <div className="bg-white/40 backdrop-blur-xl border border-text-dark/5 rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-luxury flex flex-col flex-1 min-h-0">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          {isLoading ? (
            <div className="p-10 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-6 py-4 border-b border-text-dark/5">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-1/4" />
                    <Skeleton className="h-2 w-1/3" />
                  </div>
                  <Skeleton className="h-10 w-24 rounded-full" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              ))}
            </div>
          ) : filteredEntries.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-text-dark/5 text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/40 bg-cream/35">
                  <th className="py-6 px-8">Client</th>
                  <th className="py-6 px-8">Preferred Date</th>
                  <th className="py-6 px-8">Preferred Time</th>
                  <th className="py-6 px-8">Status</th>
                  <th className="py-6 px-8">Joined Date</th>
                  <th className="py-6 px-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-text-dark/5 text-xs text-text-dark">
                {filteredEntries.map((entry) => {
                  const isNotified = entry.notified;
                  const formattedPrefDate = format(parseISO(entry.preferred_date), 'MMMM do, yyyy');
                  const formattedJoinedDate = format(parseISO(entry.created_at), 'MMM do, yyyy');

                  return (
                    <tr key={entry.id} className="hover:bg-white/60 transition-colors group">
                      {/* Client info */}
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-cream text-gold flex items-center justify-center text-[10px] font-bold uppercase tracking-wider group-hover:bg-text-dark group-hover:text-gold transition-colors duration-500">
                            {entry.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-bold text-text-dark">{entry.name}</p>
                            <p className="text-[10px] text-text-dark/40 uppercase tracking-wider mt-0.5">{entry.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Preferred Date */}
                      <td className="py-6 px-8 font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-gold/60" />
                          <span>{formattedPrefDate}</span>
                        </div>
                      </td>

                      {/* Preferred Time */}
                      <td className="py-6 px-8 text-text-dark/70">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-gold/60" />
                          <span>{entry.preferred_time}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-6 px-8">
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border",
                          isNotified 
                            ? "bg-green-50 text-green-500 border-green-100" 
                            : "bg-amber-50 text-amber-500 border-amber-100"
                        )}>
                          {isNotified ? 'Notified' : 'Waiting'}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-6 px-8 text-text-dark/40 uppercase tracking-widest text-[10px]">
                        {formattedJoinedDate}
                      </td>

                      {/* Actions */}
                      <td className="py-6 px-8 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleNotify(entry.id)}
                            disabled={isSubmitting !== null}
                            className={cn(
                              "px-5 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm border",
                              isNotified 
                                ? "bg-white border-text-dark/10 text-text-dark/40 hover:bg-cream" 
                                : "bg-text-dark text-white border-transparent hover:bg-gold hover:text-text-dark"
                            )}
                          >
                            <Bell className="w-3 h-3" />
                            {isSubmitting === entry.id ? 'Sending...' : (isNotified ? 'Notify Again' : 'Notify')}
                          </button>
                          
                          <button
                            onClick={() => handleRemove(entry.id)}
                            disabled={isSubmitting !== null}
                            className="p-2.5 rounded-full bg-red-50 hover:bg-red-100 text-red-500 transition-colors cursor-pointer border border-red-100"
                            title="Remove from waitlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-20 text-center space-y-4">
              <ClipboardList className="w-12 h-12 text-text-dark/10 mx-auto" />
              <p className="text-sm text-text-dark/20 italic font-display">“No waitlisted souls found in the sanctuary registry.”</p>
            </div>
          )}
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

export default WaitlistManager;
