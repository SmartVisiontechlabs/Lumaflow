import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Users, 
  Mail, 
  ChevronRight, 
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
  const [clientHistory, setClientHistory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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
      // Get unique clients by email from bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookings) {
        // Group by email
        const clientMap = new Map();
        bookings.forEach(b => {
          if (!clientMap.has(b.email)) {
            clientMap.set(b.email, {
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
        });
        setClients(Array.from(clientMap.values()));
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      showToast('Failed to retrieve soul archives', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter(client => 
    client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 h-full flex flex-col">
      {/* Header Actions */}
      <div className="flex justify-between items-center px-4 relative z-10">
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

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-12 min-h-0">
        {/* Client List */}
        <div className="lg:col-span-1 bg-white/40 backdrop-blur-xl border border-text-dark/5 rounded-[3rem] overflow-hidden shadow-luxury flex flex-col min-h-0">
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
                      "w-full p-10 text-left transition-all duration-500 group relative",
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
        <div className="lg:col-span-2">
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
                <div className="bg-white/40 backdrop-blur-xl border border-text-dark/5 rounded-[3rem] p-12 shadow-luxury space-y-12 flex-1 overflow-y-auto custom-scrollbar">
                  {/* Client Profile */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-8">
                      <div className="w-24 h-24 bg-text-dark rounded-full flex items-center justify-center text-3xl font-display text-gold shadow-luxury border-4 border-white">
                        {selectedClient.fullName.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <h3 className="text-4xl font-display text-text-dark tracking-tight">{selectedClient.fullName}</h3>
                          {selectedClient.sessionCount > 3 && (
                            <span className="px-4 py-1.5 bg-gold text-white text-[9px] font-bold uppercase tracking-[0.3em] rounded-full shadow-button">Sovereign Client</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-text-dark/40">
                            <Mail className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-medium tracking-wide">{selectedClient.email}</span>
                          </div>
                          <div className="w-1 h-1 bg-text-dark/10 rounded-full" />
                          <div className="flex items-center gap-2 text-text-dark/40">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-medium tracking-wide uppercase">Member since {format(new Date(selectedClient.bookings[selectedClient.bookings.length - 1].created_at), 'MMM yyyy')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-8">
                    {[
                      { label: 'Total Rituals', value: selectedClient.sessionCount, icon: History },
                      { label: 'Last Presence', value: format(new Date(selectedClient.lastSession), 'MMM do, yy'), icon: Calendar },
                      { label: 'Communication', value: 'Enabled', icon: MessageSquare },
                    ].map((stat) => (
                      <div key={stat.label} className="p-8 bg-white border border-text-dark/5 rounded-[2.5rem] shadow-sm space-y-3">
                        <div className="p-3 bg-cream rounded-xl w-fit text-gold">
                          <stat.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 mb-1">{stat.label}</p>
                          <p className="text-xl font-bold text-text-dark">{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Ritual History */}
                  <div className="space-y-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-text-dark/20 italic">Ritual Archive</p>
                    <div className="space-y-4">
                      {selectedClient.bookings.map((booking: any) => (
                        <div key={booking.id} className="p-8 bg-cream/30 border border-text-dark/5 rounded-[2.5rem] flex items-center justify-between group hover:bg-white hover:border-gold/30 hover:shadow-luxury transition-all duration-700">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-gold group-hover:bg-text-dark transition-all duration-700 shadow-sm border border-text-dark/5">
                              {booking.duration}
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-text-dark tracking-widest uppercase">{booking.selected_session}</h5>
                              <p className="text-[9px] text-text-dark/30 uppercase tracking-[0.2em] mt-1">{format(new Date(booking.selected_date), 'MMMM do, yyyy')} • {booking.selected_time} EST</p>
                            </div>
                          </div>
                          <span className={cn(
                            "text-[8px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full border transition-all duration-700",
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
