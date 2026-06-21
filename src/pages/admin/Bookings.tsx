import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  X, 
  Clock, 
  Calendar, 
  Mail, 
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Toast, ToastType } from '../../components/ui/Toast';
import { adminSupabase as supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { adminService } from '../../services/adminService';
import { followUpMap } from '../../data/recommendationMap';
import { Sparkles, Send } from 'lucide-react';

export function parseIntakeFields(intentionsStr: string) {
  let intentions = intentionsStr || '';
  let challenges = '';
  let desiredOutcomes = '';

  const journeyRegex = /^\[Journey:\s*([^\]]+)\]\s*/;
  const journeyMatch = intentions.match(journeyRegex);
  if (journeyMatch) {
    intentions = intentions.replace(journeyRegex, '');
  }

  const intentionsPrefix = 'Intentions: ';
  const challengesPrefix = 'Challenges: ';
  const outcomesPrefix = 'Desired Outcomes: ';

  if (intentions.includes(intentionsPrefix) || intentions.includes(challengesPrefix) || intentions.includes(outcomesPrefix)) {
    const lines = intentions.split('\n');
    let currentField = 'intentions';
    let intAccum: string[] = [];
    let chalAccum: string[] = [];
    let outAccum: string[] = [];

    for (const line of lines) {
      if (line.startsWith(intentionsPrefix)) {
        currentField = 'intentions';
        intAccum.push(line.substring(intentionsPrefix.length));
      } else if (line.startsWith(challengesPrefix)) {
        currentField = 'challenges';
        chalAccum.push(line.substring(challengesPrefix.length));
      } else if (line.startsWith(outcomesPrefix)) {
        currentField = 'outcomes';
        outAccum.push(line.substring(outcomesPrefix.length));
      } else {
        if (currentField === 'intentions') intAccum.push(line);
        else if (currentField === 'challenges') chalAccum.push(line);
        else if (currentField === 'outcomes') outAccum.push(line);
      }
    }

    intentions = intAccum.join('\n').trim();
    challenges = chalAccum.join('\n').trim();
    desiredOutcomes = outAccum.join('\n').trim();
  }

  return { intentions, challenges, desiredOutcomes };
}

const AdminBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Follow-up Ritual System State
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [followUpHistory, setFollowUpHistory] = useState<any[]>([]);
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([]);
  const [adminNote, setAdminNote] = useState('');
  const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);
  const [showSuccessState, setShowSuccessState] = useState(false);

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
    fetchBookings();
  }, []);

  // Fetch follow-up history when a booking is selected
  useEffect(() => {
    if (selectedBooking) {
      fetchFollowUpHistory(selectedBooking.id);
    } else {
      setFollowUpHistory([]);
    }
  }, [selectedBooking]);

  const fetchFollowUpHistory = async (bookingId: string) => {
    try {
      const history = await adminService.getFollowUpRituals(bookingId);
      setFollowUpHistory(history);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleSendFollowUp = async () => {
    if (selectedRecommendations.length === 0) {
      showToast('Please select at least one ritual', 'error');
      return;
    }

    setIsSendingFollowUp(true);
    try {
      const recommendations = followUpMap[selectedBooking.emotion.toLowerCase()] || followUpMap.neutral;
      const ritualsToInsert = selectedRecommendations.map(ritualName => {
        const ritualData = recommendations.find(r => r.ritual === ritualName);
        return {
          booking_id: selectedBooking.id,
          client_email: selectedBooking.email,
          client_name: selectedBooking.full_name,
          ritual_name: ritualName,
          ritual_description: ritualData?.insight || '',
          ritual_duration: ritualData?.duration || 60,
          admin_note: adminNote,
          status: 'sent',
          created_at: new Date().toISOString()
        };
      });

      await adminService.sendFollowUpRituals(ritualsToInsert);
      
      // Trigger backend email delivery for production stability
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;
        
        await fetch(`${API_URL}/bookings/rituals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            bookingId: selectedBooking.id,
            clientEmail: selectedBooking.email,
            clientName: selectedBooking.full_name,
            rituals: ritualsToInsert,
            adminNote: adminNote
          })
        });
        console.log('Backend ritual email triggered successfully');
      } catch (emailError) {
        console.error('Failed to trigger backend ritual email:', emailError);
      }
      
      setShowSuccessState(true);
      setTimeout(() => {
        setIsFollowUpModalOpen(false);
        setShowSuccessState(false);
        setSelectedRecommendations([]);
        setAdminNote('');
        fetchFollowUpHistory(selectedBooking.id);
      }, 3000);
    } catch (error) {
      console.error('Error sending follow-up:', error);
      showToast('Failed to share follow-up rituals', 'error');
    } finally {
      setIsSendingFollowUp(false);
    }
  };

  const toggleRecommendation = (ritual: string) => {
    setSelectedRecommendations(prev => {
      if (prev.includes(ritual)) {
        return prev.filter(r => r !== ritual);
      }
      if (prev.length >= 3) {
        showToast('Maximum 3 rituals can be selected', 'info');
        return prev;
      }
      return [...prev, ritual];
    });
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .order('selected_date', { ascending: false });
      
      if (data) setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      showToast('Failed to retrieve sanctuary records', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ booking_status: status, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      
      showToast(`Ritual ${status} successfully`, 'success');
      fetchBookings();
      
      if (selectedBooking?.id === id) {
        setSelectedBooking({ ...selectedBooking, booking_status: status });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Failed to update ritual status', 'error');
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (window.confirm('Are you certain you wish to archive this ritual journey? This action will cancel the booking.')) {
      await handleStatusUpdate(id, 'cancelled');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.booking_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.booking_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
      case 'pending': return <Clock className="w-3.5 h-3.5 text-gold" />;
      case 'cancelled': return <XCircle className="w-3.5 h-3.5 text-red-400" />;
      default: return <AlertCircle className="w-3.5 h-3.5 text-text-dark/20" />;
    }
  };

  return (
    <div className="space-y-12 h-full flex flex-col">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
        <div className="relative w-full md:w-[400px] group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-text-dark/20 group-focus-within:text-gold transition-colors duration-500" />
          </div>
          <input 
            type="text"
            placeholder="Search Reference, Client, or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/40 backdrop-blur-xl border border-text-dark/5 py-5 pl-14 pr-6 rounded-2xl text-xs uppercase tracking-widest focus:outline-none focus:border-gold/30 focus:bg-white transition-all duration-700 placeholder:text-text-dark/20"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 p-1.5 bg-white/40 backdrop-blur-xl border border-text-dark/5 rounded-2xl">
            {['all', 'confirmed', 'pending', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-6 py-3 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-500",
                  statusFilter === status 
                    ? "bg-text-dark text-white shadow-luxury" 
                    : "text-text-dark/40 hover:text-text-dark hover:bg-white"
                )}
              >
                {status}
              </button>
            ))}
          </div>
          <button className="p-4 bg-white/40 border border-text-dark/5 rounded-2xl text-text-dark/40 hover:text-gold hover:bg-white transition-all duration-500">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="flex-1 bg-white/40 backdrop-blur-xl border border-text-dark/5 rounded-[3rem] overflow-hidden shadow-luxury flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-text-dark/5">
                <th className="px-10 py-8 text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/20">Booking Ref</th>
                <th className="px-10 py-8 text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/20">Client</th>
                <th className="px-10 py-8 text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/20">Ritual</th>
                <th className="px-10 py-8 text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/20">Schedule (EST)</th>
                <th className="px-10 py-8 text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/20">Status</th>
                <th className="px-10 py-8 text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-text-dark/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-10 py-16">
                    <TableSkeleton />
                  </td>
                </tr>
              ) : filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr 
                    key={booking.id} 
                    onClick={() => {
                      console.log("BOOKING SELECTED:", booking);
                      setSelectedBooking(booking);
                    }}
                    className="group hover:bg-white/80 transition-all duration-500 cursor-pointer"
                  >
                    <td className="px-10 py-8">
                      <span className="text-[10px] font-bold font-mono tracking-widest text-text-dark/40 group-hover:text-gold transition-colors">{booking.booking_reference}</span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-text-dark">{booking.full_name}</p>
                        <p className="text-[9px] text-text-dark/30 uppercase tracking-widest">{booking.email}</p>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-cream rounded-full flex items-center justify-center text-[10px] font-bold text-gold group-hover:bg-text-dark transition-all duration-700">
                          {booking.duration === 60 ? 'I' : booking.duration === 90 ? 'II' : 'III'}
                        </div>
                        <span className="text-[10px] font-bold text-text-dark/60 uppercase tracking-widest">{booking.selected_session}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-text-dark">{format(new Date(booking.selected_date), 'EEEE, MMM do')}</p>
                        <p className="text-[10px] text-gold/60 uppercase tracking-widest">{booking.selected_time} EST</p>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-700",
                        booking.booking_status === 'confirmed' ? "bg-green-50 text-green-500 border-green-100" :
                        booking.booking_status === 'pending' ? "bg-gold/5 text-gold border-gold/10" :
                        "bg-red-50 text-red-400 border-red-100"
                      )}>
                        {getStatusIcon(booking.booking_status)}
                        {booking.booking_status}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <button className="p-3 text-text-dark/10 hover:text-text-dark hover:bg-cream rounded-xl transition-all">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-32 text-center space-y-4">
                    <p className="text-sm text-text-dark/20 italic font-display">“No ritual journeys found in the archives.”</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Slide-over */}
      <AnimatePresence>
        {selectedBooking && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="fixed inset-0 bg-text-dark/20 backdrop-blur-md z-[50]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 h-full w-full max-w-[600px] bg-white shadow-2xl z-[60] flex flex-col border-l border-text-dark/5"
            >
              {/* Panel Header */}
              <div className="p-12 border-b border-text-dark/5 flex justify-between items-center bg-cream/30">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold/60 italic">Ritual Journey Details</span>
                  <h3 className="text-3xl font-display text-text-dark tracking-tight">{selectedBooking.booking_reference}</h3>
                </div>
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="p-4 bg-white rounded-full text-text-dark/20 hover:text-text-dark hover:shadow-luxury transition-all duration-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
                {/* Status Quick Actions */}
                <div className="bg-white border border-text-dark/5 rounded-[2rem] p-8 space-y-6 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-text-dark/20">Manage Journey Status</p>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { status: 'confirmed', icon: CheckCircle2, color: 'text-green-500' },
                      { status: 'pending', icon: Clock, color: 'text-gold' },
                      { status: 'cancelled', icon: XCircle, color: 'text-red-400' },
                    ].map((item) => (
                      <button
                        key={item.status}
                        onClick={() => handleStatusUpdate(selectedBooking.id, item.status)}
                        className={cn(
                          "flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-500 group",
                          selectedBooking.booking_status === item.status 
                            ? "bg-text-dark border-text-dark text-white shadow-luxury" 
                            : "bg-white border-text-dark/5 text-text-dark/40 hover:border-gold/30 hover:text-text-dark"
                        )}
                      >
                        <item.icon className={cn("w-4 h-4", selectedBooking.booking_status === item.status ? "text-gold" : item.color)} />
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em]">{item.status}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid Details */}
                <div className="grid grid-cols-2 gap-12">
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/20 italic">Client Presence</p>
                    <p className="text-lg font-bold text-text-dark">{selectedBooking.full_name}</p>
                    <div className="flex items-center gap-2 text-gold hover:text-text-dark transition-colors cursor-pointer group">
                      <Mail className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                      <span className="text-[11px] font-medium tracking-wide">{selectedBooking.email}</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/20 italic">Emotional State</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-cream rounded-full border border-gold/10">
                      <span className="text-[10px] font-bold text-gold uppercase tracking-[0.2em]">{selectedBooking.emotion}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/20 italic">Session Specifics</p>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-8 bg-cream/30 border border-text-dark/5 rounded-[2rem] flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <Calendar className="w-5 h-5 text-gold/40" />
                        <div>
                          <p className="text-[11px] font-bold text-text-dark uppercase tracking-widest">{selectedBooking.selected_session}</p>
                          <p className="text-[9px] text-text-dark/30 uppercase tracking-[0.2em] mt-1">{selectedBooking.session_format} • {selectedBooking.duration} Minutes</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-bold text-text-dark uppercase tracking-widest">{format(new Date(selectedBooking.selected_date), 'MMMM do, yyyy')}</p>
                        <p className="text-[11px] font-bold text-gold uppercase tracking-[0.2em] mt-1">{selectedBooking.selected_time} EST</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Zoom Credentials (only if Virtual) */}
                {selectedBooking.session_format?.toLowerCase() === 'virtual' && (
                  <div className="space-y-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/20 italic">Zoom Meeting Details</p>
                    <div className="bg-white border border-text-dark/5 rounded-[2rem] p-8 shadow-sm space-y-6">
                      <div className="grid grid-cols-2 gap-6 text-xs border-b border-text-dark/5 pb-4">
                        <div>
                          <span className="text-[9px] font-bold text-text-dark/40 uppercase tracking-widest block mb-1">Meeting ID</span>
                          <span className="font-mono text-text-dark font-semibold select-all">{selectedBooking.zoom_meeting_id || 'Not Provisioned'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-text-dark/40 uppercase tracking-widest block mb-1">Passcode</span>
                          <span className="font-mono text-text-dark font-semibold select-all">{selectedBooking.meeting_password || 'None'}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 text-xs border-b border-text-dark/5 pb-4">
                        <div>
                          <span className="text-[9px] font-bold text-text-dark/40 uppercase tracking-widest block mb-1">Zoom Connection Status</span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gold/10 text-gold-light border border-gold/10">
                            {selectedBooking.zoom_status || 'pending'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 pt-2">
                        {selectedBooking.zoom_start_url && (
                          <a
                            href={selectedBooking.zoom_start_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-4 bg-gold text-white text-center rounded-xl text-[9px] font-bold uppercase tracking-[0.3em] hover:bg-text-dark transition-all duration-700 shadow-luxury flex items-center justify-center gap-2"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Start Zoom Meeting (As Host)
                          </a>
                        )}
                        {selectedBooking.zoom_join_url && (
                          <a
                            href={selectedBooking.zoom_join_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-4 bg-white border border-text-dark/10 text-text-dark text-center rounded-xl text-[9px] font-bold uppercase tracking-[0.3em] hover:bg-cream transition-all duration-500 flex items-center justify-center gap-2"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Client Join Link
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Intentions */}
                <div className="space-y-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/20 italic">Soul's Intention</p>
                  <div className="bg-white border border-text-dark/5 rounded-[2rem] p-8 shadow-sm space-y-4">
                    {(() => {
                      const { intentions, challenges, desiredOutcomes } = parseIntakeFields(selectedBooking.intentions);
                      return (
                        <>
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold/80 mb-1">Intentions</p>
                            <p className="text-sm text-text-dark/60 font-light leading-relaxed font-display italic">
                              “{intentions || 'No specific intentions noted.'}”
                            </p>
                          </div>
                          {challenges && (
                            <div className="border-t border-text-dark/5 pt-3">
                              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold/80 mb-1">Current Challenges</p>
                              <p className="text-sm text-text-dark/60 font-light leading-relaxed font-display italic">
                                “{challenges}”
                              </p>
                            </div>
                          )}
                          {desiredOutcomes && (
                            <div className="border-t border-text-dark/5 pt-3">
                              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold/80 mb-1">Desired Outcomes</p>
                              <p className="text-sm text-text-dark/60 font-light leading-relaxed font-display italic">
                                “{desiredOutcomes}”
                              </p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/20 italic">Therapist Notes</p>
                    <button className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold hover:text-text-dark transition-colors">Edit Notes</button>
                  </div>
                  <div className="bg-white border border-text-dark/5 rounded-[2rem] p-8 shadow-sm h-40">
                    <p className="text-xs text-text-dark/20 italic uppercase tracking-[0.1em]">Internal sanctuary observations...</p>
                  </div>
                </div>
                {/* Sent Follow-Up Rituals History */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-[1px] flex-1 bg-text-dark/5" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-gold/60 italic">The Journey Continues</p>
                    <div className="h-[1px] flex-1 bg-text-dark/5" />
                  </div>
                  
                  <div className="space-y-4">
                    {followUpHistory.length > 0 ? (
                      followUpHistory.map((ritual, idx) => (
                        <div 
                          key={idx} 
                          className="group relative bg-white border border-text-dark/5 rounded-[2rem] p-8 transition-all duration-700 hover:shadow-luxury hover:border-gold/20"
                        >
                          <div className="flex justify-between items-start gap-6">
                            <div className="space-y-3 flex-1">
                              <div className="flex items-center gap-3">
                                <p className="text-[11px] font-bold text-text-dark uppercase tracking-[0.2em]">{ritual.ritual_name}</p>
                                <div className="h-[1px] w-8 bg-gold/30" />
                              </div>
                              <p className="text-[11px] text-text-dark/40 font-light leading-relaxed italic">
                                "{ritual.ritual_description}"
                              </p>
                              <div className="flex items-center gap-6 pt-2">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3 h-3 text-text-dark/20" />
                                  <p className="text-[9px] text-text-dark/30 uppercase tracking-[0.15em]">
                                    Sent: {format(new Date(ritual.created_at), 'MMMM d, h:mm a')}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                                  <p className="text-[9px] font-bold text-green-500/60 uppercase tracking-[0.15em]">
                                    Status: Delivered
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center text-gold group-hover:bg-text-dark group-hover:text-white transition-all duration-700">
                              <Sparkles className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-cream/20 border border-dashed border-text-dark/10 rounded-[2rem] p-12 text-center">
                        <p className="text-xs text-text-dark/20 italic uppercase tracking-[0.2em]">No integration rituals shared in this journey yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Panel Footer */}
              <div className="p-12 border-t border-text-dark/5 bg-cream/30 flex items-center justify-between">
                <button 
                  onClick={() => handleCancelBooking(selectedBooking.id)}
                  className="px-8 py-4 bg-white border border-red-100 text-red-400 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-red-50 transition-all duration-500"
                >
                  Cancel Ritual
                </button>
                <button 
                  onClick={() => setIsFollowUpModalOpen(true)}
                  className="flex items-center gap-3 px-10 py-5 bg-text-dark text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] shadow-button hover:bg-gold transition-all duration-700 group"
                >
                  Send Follow-up Ritual
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Follow-up Ritual Modal */}
      <AnimatePresence>
        {isFollowUpModalOpen && selectedBooking && (
          <>
          <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 md:p-8 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFollowUpModalOpen(false)}
              className="absolute inset-0 bg-text-dark/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-[9999] w-full max-w-[1000px] bg-white rounded-[3rem] shadow-luxury overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header (Sticky) */}
              <div className="flex-shrink-0 p-10 md:p-12 border-b border-text-dark/5 flex justify-between items-center bg-cream/30">
                <div className="space-y-2">
                  <h3 className="text-4xl font-display text-text-dark tracking-tight leading-none">The Journey Continues</h3>
                  <p className="text-xs text-text-dark/40 font-light italic uppercase tracking-[0.1em]">Offer a supportive ritual to deepen integration and healing.</p>
                </div>
                <button 
                  onClick={() => setIsFollowUpModalOpen(false)}
                  className="p-4 bg-white rounded-full text-text-dark/20 hover:text-text-dark transition-all duration-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                <AnimatePresence mode="wait">
                  {showSuccessState ? (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center justify-center p-12 md:p-20 text-center space-y-10 min-h-[500px]"
                    >
                      <div className="w-28 h-28 rounded-full bg-cream flex items-center justify-center text-gold shadow-luxury-gold/20 shadow-2xl animate-bounce-slow">
                        <CheckCircle2 className="w-12 h-12" />
                      </div>
                      <div className="space-y-6 max-w-xl">
                        <h4 className="text-4xl font-display text-text-dark">Follow-Up Ritual Shared</h4>
                        <p className="text-lg text-text-dark/60 font-light italic leading-relaxed">
                          "The client's healing journey has been gently supported. Your recommendation has been shared with their sanctuary."
                        </p>
                      </div>
                      <div className="h-[1px] w-16 bg-gold/30" />
                      
                      <button 
                        onClick={() => setIsFollowUpModalOpen(false)}
                        className="px-12 py-5 bg-text-dark text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] shadow-button hover:bg-gold transition-all duration-700"
                      >
                        Return to Sanctuary
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-12 md:p-16 space-y-20"
                    >
                      {/* Healing Recommendation Grid */}
                      <div className="space-y-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-text-dark/5 pb-8">
                          <div className="space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-text-dark/20 italic">Healing Path for Presence</p>
                            <h5 className="text-2xl font-display text-text-dark capitalize">{selectedBooking.emotion} Integration</h5>
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold/60 bg-gold/5 px-6 py-2 rounded-full border border-gold/10">
                            {selectedRecommendations.length} / 3 Rituals Selected
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {(followUpMap[selectedBooking.emotion.toLowerCase()] || followUpMap.neutral).map((ritual, idx) => {
                            const isSelected = selectedRecommendations.includes(ritual.ritual);
                            return (
                              <motion.div 
                                key={idx}
                                whileHover={{ y: -6, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => toggleRecommendation(ritual.ritual)}
                                className={cn(
                                  "group relative p-10 rounded-[3rem] border text-left transition-all duration-700 cursor-pointer overflow-hidden flex flex-col h-full min-h-[320px]",
                                  isSelected 
                                    ? "bg-text-dark border-text-dark shadow-luxury-gold" 
                                    : "bg-cream/40 border-text-dark/5 hover:border-gold/30 hover:bg-white"
                                )}
                              >
                                {isSelected && (
                                  <motion.div 
                                    layoutId="selected-bg"
                                    className="absolute inset-0 bg-gold/5 pointer-events-none"
                                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                  />
                                )}
                                
                                <div className="flex justify-between items-start mb-8 relative z-10">
                                  <div className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-700",
                                    isSelected ? "bg-gold/20 text-gold shadow-luxury-sm" : "bg-white text-gold/40 group-hover:text-gold"
                                  )}>
                                    <Sparkles className="w-5 h-5" />
                                  </div>
                                  <div className="text-right">
                                    <span className={cn(
                                      "text-[10px] font-bold uppercase tracking-[0.3em] block",
                                      isSelected ? "text-gold/60" : "text-text-dark/20"
                                    )}>{ritual.duration} MIN</span>
                                  </div>
                                </div>
                                
                                <div className="space-y-4 relative z-10 flex-1 flex flex-col justify-between">
                                  <div>
                                    <h4 className={cn(
                                      "font-display text-2xl transition-colors duration-700 mb-2 leading-tight",
                                      isSelected ? "text-white" : "text-text-dark group-hover:text-gold"
                                    )}>{ritual.ritual}</h4>
                                    <p className={cn(
                                      "text-[9px] uppercase tracking-[0.3em] font-bold",
                                      isSelected ? "text-gold/60" : "text-text-dark/40"
                                    )}>{ritual.focus}</p>
                                  </div>
                                  
                                  <p className={cn(
                                    "text-[11px] font-light leading-relaxed italic transition-colors duration-700 mt-4 line-clamp-4",
                                    isSelected ? "text-white/60" : "text-text-dark/40"
                                  )}>
                                    "{ritual.insight}"
                                  </p>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Sanctuary Note */}
                      <div className="space-y-8 pt-8 border-t border-text-dark/5">
                        <div className="flex items-center gap-6">
                          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-text-dark/20 italic">Optional Sanctuary Note</p>
                          <div className="h-[1px] flex-1 bg-text-dark/5" />
                        </div>
                        <textarea 
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          placeholder="Add a personal reflection for their integration journey..."
                          className="w-full bg-cream/20 border border-text-dark/5 rounded-[3rem] p-12 text-lg text-text-dark min-h-[200px] focus:outline-none focus:border-gold/30 focus:bg-white transition-all duration-1000 placeholder:text-text-dark/20 italic font-light shadow-inner resize-none"
                        />
                      </div>

                      {/* Follow-up History */}
                      <div className="space-y-12 pt-12 border-t border-text-dark/5">
                        <div className="flex items-center gap-4">
                          <div className="h-[1px] flex-1 bg-text-dark/5" />
                          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-gold/60 italic">The Journey Continues</p>
                          <div className="h-[1px] flex-1 bg-text-dark/5" />
                        </div>
                        
                        <div className="space-y-6">
                          {followUpHistory.length > 0 ? (
                            followUpHistory.map((ritual, idx) => (
                              <div 
                                key={idx} 
                                className="group relative bg-white border border-text-dark/5 rounded-[2rem] p-8 transition-all duration-700 hover:shadow-luxury hover:border-gold/20"
                              >
                                <div className="flex justify-between items-start gap-6">
                                  <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-3">
                                      <p className="text-[11px] font-bold text-text-dark uppercase tracking-[0.2em]">{ritual.ritual_name}</p>
                                      <div className="h-[1px] w-8 bg-gold/30" />
                                    </div>
                                    <p className="text-[11px] text-text-dark/40 font-light leading-relaxed italic">
                                      "{ritual.ritual_description}"
                                    </p>
                                    <div className="flex items-center gap-6 pt-2">
                                      <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3 text-text-dark/20" />
                                        <p className="text-[9px] text-text-dark/30 uppercase tracking-[0.15em]">
                                          Sent: {format(new Date(ritual.created_at), 'MMMM d, h:mm a')}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                                        <p className="text-[9px] font-bold text-green-500/60 uppercase tracking-[0.15em]">
                                          Status: Delivered
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center text-gold group-hover:bg-text-dark group-hover:text-white transition-all duration-700">
                                    <Sparkles className="w-4 h-4" />
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="bg-cream/20 border border-dashed border-text-dark/10 rounded-[2rem] p-12 text-center">
                              <p className="text-xs text-text-dark/20 italic uppercase tracking-[0.2em]">No integration rituals shared in this journey yet.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Modal Footer (Sticky) */}
              {!showSuccessState && (
                <div className="flex-shrink-0 p-10 md:p-12 border-t border-text-dark/5 bg-cream/30 flex justify-end gap-10">
                  <button 
                    onClick={() => setIsFollowUpModalOpen(false)}
                    className="px-10 py-5 text-[10px] font-bold uppercase tracking-[0.5em] text-text-dark/40 hover:text-text-dark transition-colors"
                  >
                    Return to Sanctuary
                  </button>
                  <button 
                    onClick={handleSendFollowUp}
                    disabled={isSendingFollowUp || selectedRecommendations.length === 0}
                    className="flex items-center gap-5 px-16 py-6 bg-text-dark text-white rounded-[2rem] text-[11px] font-bold uppercase tracking-[0.5em] shadow-button hover:bg-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-1000 group"
                  >
                    {isSendingFollowUp ? 'Sharing Path...' : 'Share Integration Ritual'}
                    <Send className={cn("w-5 h-5 transition-transform duration-700", !isSendingFollowUp && "group-hover:translate-x-1 group-hover:-translate-y-1")} />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
          </>
        )}
      </AnimatePresence>

      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />
    </div>
  );
};

export default AdminBookings;
