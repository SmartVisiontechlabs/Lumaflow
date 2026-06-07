import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Users, 
  Mail, 
  ChevronRight, 
  ChevronLeft,
  History, 
  MessageSquare,
  Star,
  Clock,
  X,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { adminSupabase as supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { Skeleton } from '../../components/ui/Skeleton';
import { Toast, ToastType } from '../../components/ui/Toast';

const ClientManager = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Credit adjustment modal states
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustType, setAdjustType] = useState<'delta' | 'absolute'>('delta');
  const [adjustValue, setAdjustValue] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch all bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      // 2. Fetch all user profiles to map emails to user_id
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('*');

      const profileMap = new Map();
      if (profiles) {
        profiles.forEach(p => {
          profileMap.set(p.email.toLowerCase(), p.id);
        });
      }

      // 3. Fetch all membership credits
      const { data: creditsData } = await supabase
        .from('membership_credits')
        .select('*');

      const creditsMap = new Map();
      if (creditsData) {
        creditsData.forEach(c => {
          creditsMap.set(c.email.toLowerCase(), c);
          if (c.user_id) {
            creditsMap.set(c.user_id, c);
          }
        });
      }

      if (bookings) {
        // Group by email
        const clientMap = new Map();
        bookings.forEach(b => {
          const emailLower = b.email.toLowerCase();
          const profileId = profileMap.get(emailLower) || b.user_id;
          
          if (!clientMap.has(b.email)) {
            clientMap.set(b.email, {
              userId: profileId,
              fullName: b.full_name,
              email: b.email,
              sessionCount: 0,
              lastSession: b.selected_date,
              bookings: []
            });
          }
          const client = clientMap.get(b.email);
          client.sessionCount++;
          client.bookings.push(b);
          if (profileId && !client.userId) {
            client.userId = profileId;
          }
        });

        // Merge credits data
        const clientList = Array.from(clientMap.values()).map(client => {
          const emailLower = client.email.toLowerCase();
          const creds = creditsMap.get(emailLower) || (client.userId ? creditsMap.get(client.userId) : null);
          return {
            ...client,
            remainingCredits: creds ? creds.remaining_credits : 0,
            totalCredits: creds ? creds.total_credits : 0,
            usedCredits: creds ? creds.used_credits : 0,
          };
        });

        setClients(clientList);

        // Update selectedClient reference if already open
        if (selectedClient) {
          const updatedSelected = clientList.find(c => c.email === selectedClient.email);
          if (updatedSelected) {
            setSelectedClient(updatedSelected);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      showToast('Failed to retrieve sanctuary client archives', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdjustCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !selectedClient.userId) {
      showToast('No user profile linked to this client.', 'error');
      return;
    }

    const val = Number(adjustValue);
    if (isNaN(val)) {
      showToast('Please enter a valid number', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

      const payload: any = {};
      if (adjustType === 'delta') {
        payload.creditsDelta = val;
      } else {
        payload.absoluteCredits = val;
      }

      const response = await fetch(`${API_URL}/admin/clients/${selectedClient.userId}/credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to adjust client credits');
      }

      showToast('Sanctuary credits refined successfully', 'success');
      setIsAdjustModalOpen(false);
      setAdjustValue('0');
      await fetchClients();
    } catch (err: any) {
      console.error('Error adjusting credits:', err);
      showToast(err.message || 'Failed to refine client credits', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClients = clients.filter(client => 
    client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 lg:space-y-12 h-full flex flex-col">
      {/* Header Actions */}
      <div className={cn(
        "flex justify-between items-center px-4 relative z-10",
        selectedClient !== null && "max-lg:hidden"
      )}>
        <div className="relative w-full max-w-[400px] group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-text-dark/20 group-focus-within:text-gold transition-colors duration-500" />
          </div>
          <input 
            type="text"
            placeholder="Search Sanctuary Clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/40 backdrop-blur-xl border border-text-dark/5 py-5 pl-14 pr-6 rounded-2xl text-xs uppercase tracking-widest focus:outline-none focus:border-gold/30 focus:bg-white transition-all duration-700 placeholder:text-text-dark/20"
          />
        </div>
        <div className="flex items-center gap-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-text-dark/20 italic">Total Registered: {clients.length}</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12 min-h-0">
        {/* Client List */}
        <div className={cn(
          "lg:col-span-1 bg-white/40 backdrop-blur-xl border border-text-dark/5 rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-luxury flex flex-col min-h-0",
          selectedClient !== null && "max-lg:hidden"
        )}>
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {isLoading ? (
              <div className="p-10 space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <Skeleton variant="circular" className="w-12 h-12" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-2 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredClients.length > 0 ? (
              <div className="divide-y divide-text-dark/5">
                {filteredClients.map((client) => (
                  <button
                    key={client.email}
                    onClick={() => setSelectedClient(client)}
                    className={cn(
                       "w-full p-6 sm:p-10 text-left transition-all duration-500 group relative",
                       selectedClient?.email === client.email ? "bg-white" : "hover:bg-white/60"
                    )}
                  >
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-700",
                        selectedClient?.email === client.email ? "bg-text-dark text-gold" : "bg-cream text-gold group-hover:bg-text-dark group-hover:text-gold"
                      )}>
                        {client.fullName.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-text-dark mb-1 truncate">{client.fullName}</h4>
                        <p className="text-[10px] text-text-dark/30 uppercase tracking-widest truncate">{client.email}</p>
                      </div>
                      {client.sessionCount > 3 && (
                        <div className="p-2 bg-gold/5 rounded-lg">
                          <Star className="w-3 h-3 text-gold" fill="currentColor" />
                        </div>
                      )}
                    </div>
                    {selectedClient?.email === client.email && (
                      <motion.div layoutId="clientIndicator" className="absolute left-0 top-0 bottom-0 w-1 bg-gold rounded-r-full" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center space-y-4">
                <p className="text-sm text-text-dark/20 italic font-display">“No clients found in the sanctuary records.”</p>
              </div>
            )}
          </div>
        </div>

        {/* Client Deep-dive */}
        <div className={cn(
          "lg:col-span-2",
          selectedClient === null && "max-lg:hidden"
        )}>
          <AnimatePresence mode="wait">
            {selectedClient ? (
              <motion.div
                key={selectedClient.email}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="h-full flex flex-col"
              >
                <div className="bg-white/40 backdrop-blur-xl border border-text-dark/5 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 shadow-luxury space-y-6 sm:space-y-12 flex-1 overflow-y-auto custom-scrollbar">
                  {/* Client Profile Header / Info */}
                  <div className="flex flex-col gap-6">
                    {/* Back to Clients Button */}
                    <button
                      onClick={() => setSelectedClient(null)}
                      className="lg:hidden flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#CBAE73] hover:text-[#CBAE73]/80 transition-colors self-start"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back to Clients
                    </button>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 shrink-0 bg-text-dark rounded-full flex items-center justify-center text-xl sm:text-3xl font-display text-gold shadow-luxury border-2 sm:border-4 border-white">
                        {selectedClient.fullName.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-2xl sm:text-4xl font-display text-text-dark tracking-tight">{selectedClient.fullName}</h3>
                          {selectedClient.sessionCount > 3 && (
                            <span className="px-3 py-1 bg-gold text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.3em] rounded-full shadow-button">Sovereign Client</span>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <div className="flex items-center gap-2 text-text-dark/40">
                            <Mail className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-medium tracking-wide">{selectedClient.email}</span>
                          </div>
                          <div className="hidden sm:block w-1 h-1 bg-text-dark/10 rounded-full" />
                          <div className="flex items-center gap-2 text-text-dark/40">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-medium tracking-wide uppercase">Member since {format(new Date(selectedClient.bookings[selectedClient.bookings.length - 1].created_at), 'MMM yyyy')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
                    {/* Sanctuary Credits Card */}
                    <div className="p-6 sm:p-8 bg-white border border-text-dark/5 rounded-[2.5rem] shadow-sm space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="p-3 bg-cream rounded-xl w-fit text-gold animate-pulse">
                          <Star className="w-4 h-4" />
                        </div>
                        <div className="mt-3">
                          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 mb-1">Sanctuary Credits</p>
                          <p className="text-base sm:text-lg font-bold text-text-dark">{selectedClient.remainingCredits ?? 0} Credits</p>
                        </div>
                      </div>
                      {selectedClient.userId ? (
                        <button
                          onClick={() => {
                            setAdjustType('delta');
                            setAdjustValue('0');
                            setIsAdjustModalOpen(true);
                          }}
                          className="mt-2 w-full py-2 bg-text-dark hover:bg-gold text-white hover:text-text-dark text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300 shadow-sm border border-gold/10"
                        >
                          Adjust
                        </button>
                      ) : (
                        <span className="mt-2 block w-full py-2 text-center text-text-dark/20 text-[8px] font-bold uppercase tracking-widest">No Profile</span>
                      )}
                    </div>

                    {[
                      { label: 'Total Rituals', value: selectedClient.sessionCount, icon: History },
                      { label: 'Last Presence', value: format(new Date(selectedClient.lastSession), 'MMM do, yy'), icon: Calendar },
                      { label: 'Communication', value: 'Enabled', icon: MessageSquare },
                    ].map((stat) => (
                      <div key={stat.label} className="p-6 sm:p-8 bg-white border border-text-dark/5 rounded-[2.5rem] shadow-sm space-y-3">
                        <div className="p-3 bg-cream rounded-xl w-fit text-gold">
                          <stat.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 mb-1">{stat.label}</p>
                          <p className="text-base sm:text-xl font-bold text-text-dark">{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Ritual History */}
                  <div className="space-y-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-text-dark/20 italic">Ritual Archive</p>
                    <div className="space-y-4">
                      {selectedClient.bookings.map((booking: any) => (
                        <div key={booking.id} className="p-6 sm:p-8 bg-cream/30 border border-text-dark/5 rounded-[2.5rem] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 group hover:bg-white hover:border-gold/30 hover:shadow-luxury transition-all duration-700">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-gold group-hover:bg-text-dark transition-all duration-700 shadow-sm border border-text-dark/5 shrink-0">
                              {booking.duration}
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-text-dark tracking-widest uppercase truncate">{booking.selected_session}</h5>
                              <p className="text-[9px] text-text-dark/30 uppercase tracking-[0.2em] mt-1">{format(new Date(booking.selected_date), 'MMMM do, yyyy')} • {booking.selected_time} EST</p>
                            </div>
                          </div>
                          <span className={cn(
                            "text-[8px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full border transition-all duration-700 self-start sm:self-auto",
                            booking.booking_status === 'confirmed' ? "bg-green-50 text-green-500 border-green-100" : "bg-text-dark/5 text-text-dark/40 border-text-dark/5"
                          )}>
                            {booking.booking_status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-text-dark p-20 rounded-[3rem] shadow-luxury relative overflow-hidden group h-full flex flex-col justify-center items-center text-center space-y-8"
              >
                <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-gold/10 blur-[100px] rounded-full group-hover:bg-gold/20 transition-all duration-1000" />
                <div className="relative z-10 space-y-6 max-w-sm">
                  <div className="p-8 bg-gold/10 rounded-full w-fit mx-auto border border-gold/20">
                    <Users className="w-8 h-8 text-gold" />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-3xl font-display text-white tracking-tight italic">“Invoke a client from the archive to view their spiritual journey.”</h4>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold/60 leading-relaxed">Client history and sanctuary notes</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Adjust Credits Modal */}
      <AnimatePresence>
        {isAdjustModalOpen && selectedClient && (
          <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdjustModalOpen(false)}
              className="absolute inset-0 bg-text-dark/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-[9999] w-full max-w-[450px] bg-white rounded-[3rem] shadow-luxury border border-text-dark/5 overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-10 border-b border-text-dark/5 flex justify-between items-center bg-cream/30">
                <div className="space-y-1">
                  <h3 className="text-3xl font-display text-text-dark tracking-tight leading-none">Adjust Credits</h3>
                  <p className="text-[10px] text-text-dark/40 font-light uppercase tracking-[0.1em]">{selectedClient.fullName}</p>
                </div>
                <button 
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="p-3 bg-white rounded-full text-text-dark/20 hover:text-text-dark transition-all duration-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleAdjustCredits} className="p-10 space-y-8">
                {/* Current credits readout */}
                <div className="p-6 bg-cream/30 rounded-2xl border border-text-dark/5 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-text-dark/40 uppercase tracking-widest">Current Balance</span>
                  <span className="text-sm font-bold text-gold">{selectedClient.remainingCredits ?? 0} Credits</span>
                </div>

                {/* Adjustment type selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-text-dark/30 uppercase tracking-widest block">Adjustment Protocol</label>
                  <div className="grid grid-cols-2 gap-4 p-1.5 bg-cream/20 border border-text-dark/5 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => {
                        setAdjustType('delta');
                        setAdjustValue('0');
                      }}
                      className={cn(
                        "py-3 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-500",
                        adjustType === 'delta' 
                          ? "bg-text-dark text-white shadow-luxury" 
                          : "text-text-dark/40 hover:text-text-dark hover:bg-white"
                      )}
                    >
                      Relative Delta (+/-)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAdjustType('absolute');
                        setAdjustValue(String(selectedClient.remainingCredits ?? 0));
                      }}
                      className={cn(
                        "py-3 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-500",
                        adjustType === 'absolute' 
                          ? "bg-text-dark text-white shadow-luxury" 
                          : "text-text-dark/40 hover:text-text-dark hover:bg-white"
                      )}
                    >
                      Absolute Value
                    </button>
                  </div>
                </div>

                {/* Adjustment value input */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-text-dark/30 uppercase tracking-widest block">
                    {adjustType === 'delta' ? 'Adjustment Amount (e.g. +3, -2)' : 'New Absolute Value (e.g. 10)'}
                  </label>
                  <input
                    type="number"
                    value={adjustValue}
                    onChange={(e) => setAdjustValue(e.target.value)}
                    className="w-full bg-cream/20 border border-text-dark/5 py-4 px-6 rounded-2xl text-center text-lg font-bold text-text-dark focus:outline-none focus:border-gold/30 focus:bg-white transition-all duration-500"
                    placeholder="0"
                    required
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAdjustModalOpen(false)}
                    className="flex-1 py-4 bg-white border border-text-dark/10 text-text-dark text-center rounded-xl text-[9px] font-bold uppercase tracking-[0.3em] hover:bg-cream transition-all duration-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-text-dark hover:bg-gold text-white hover:text-text-dark text-[9px] font-bold uppercase tracking-[0.3em] rounded-xl transition-all duration-500 shadow-luxury flex items-center justify-center disabled:opacity-50"
                  >
                    {isSubmitting ? 'Updating Sanctuary...' : 'Confirm'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
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

export default ClientManager;
