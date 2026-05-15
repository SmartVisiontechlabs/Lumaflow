import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Clock, 
  Zap, 
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    upcoming: 0,
    pending: 0,
    total: 0,
    cancelled: 0
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      setIsLoading(true);
      try {
        const { data: bookings } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });

        if (bookings) {
          setStats({
            upcoming: bookings.filter(b => b.booking_status === 'confirmed').length,
            pending: bookings.filter(b => b.booking_status === 'pending').length,
            total: bookings.length,
            cancelled: bookings.filter(b => b.booking_status === 'cancelled').length
          });
          setRecentBookings(bookings.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching overview:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const statCards = [
    { label: 'Upcoming Sessions', value: stats.upcoming, icon: Calendar, color: 'text-gold' },
    { label: 'Pending Rituals', value: stats.pending, icon: Clock, color: 'text-gold/60' },
    { label: 'Total Journeys', value: stats.total, icon: Users, color: 'text-text-dark/40' },
    { label: 'Cancelled', value: stats.cancelled, icon: Zap, color: 'text-red-400/40' },
  ];

  return (
    <div className="space-y-12">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="bg-white/40 backdrop-blur-xl border border-text-dark/5 p-8 rounded-[2.5rem] shadow-luxury group hover:bg-white transition-all duration-700"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 bg-cream rounded-2xl ${stat.color} group-hover:bg-text-dark group-hover:text-white transition-all duration-700`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 uppercase tracking-widest">
                <ArrowUpRight className="w-3 h-3" />
                Active
              </div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-text-dark/20 mb-2">{stat.label}</p>
            <h3 className="text-4xl font-display text-text-dark">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="lg:col-span-2 space-y-8"
        >
          <div className="flex justify-between items-end px-4">
            <div className="space-y-1">
              <h3 className="text-2xl font-display text-text-dark tracking-tight">Recent Rituals</h3>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 italic">Last 5 confirmed sessions</p>
            </div>
            <button className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold hover:text-text-dark transition-colors">View All</button>
          </div>

          <div className="bg-white/40 backdrop-blur-xl border border-text-dark/5 rounded-[3rem] overflow-hidden shadow-luxury">
            {isLoading ? (
              <div className="p-20 flex justify-center">
                <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
              </div>
            ) : recentBookings.length > 0 ? (
              <div className="divide-y divide-text-dark/5">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="p-8 hover:bg-white transition-all duration-500 group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-cream rounded-full flex items-center justify-center text-[10px] font-bold text-gold group-hover:bg-text-dark transition-all duration-700">
                          {booking.full_name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-text-dark mb-1">{booking.full_name}</h4>
                          <p className="text-[10px] text-text-dark/40 uppercase tracking-widest">{booking.selected_session}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-text-dark mb-1">
                          {format(new Date(booking.selected_date), 'MMM do')} • {booking.selected_time}
                        </p>
                        <span className={`text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${
                          booking.booking_status === 'confirmed' ? 'bg-green-50 text-green-500 border-green-100' : 'bg-gold/5 text-gold border-gold/10'
                        }`}>
                          {booking.booking_status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center space-y-4">
                <p className="text-sm text-text-dark/20 italic font-display">“The sanctuary has no active journeys yet.”</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Insights */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="space-y-8"
        >
          <div className="px-4">
            <h3 className="text-2xl font-display text-text-dark tracking-tight">Quick Actions</h3>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 italic">Operational Shortcuts</p>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Block Calendar Date', sub: 'Instant unavailability', icon: Calendar },
              { label: 'Export Ritual History', sub: 'CSV Data Sync', icon: ArrowUpRight },
              { label: 'Update Availability', sub: 'Custom slot logic', icon: Clock },
            ].map((action, i) => (
              <button 
                key={action.label}
                className="w-full flex items-center justify-between p-8 bg-white/40 backdrop-blur-xl border border-text-dark/5 rounded-[2rem] hover:bg-white hover:shadow-luxury transition-all duration-700 group text-left"
              >
                <div className="flex items-center gap-5">
                  <div className="p-3 bg-cream rounded-xl text-gold group-hover:bg-text-dark group-hover:text-white transition-all duration-700">
                    <action.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-text-dark mb-1 uppercase tracking-widest">{action.label}</h5>
                    <p className="text-[9px] text-text-dark/30 uppercase tracking-widest">{action.sub}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-text-dark/10 group-hover:text-gold transition-colors" />
              </button>
            ))}
          </div>

          <div className="bg-text-dark p-10 rounded-[3rem] shadow-luxury relative overflow-hidden group">
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[80%] bg-gold/10 blur-[60px] rounded-full group-hover:bg-gold/20 transition-all duration-1000" />
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold/60 mb-6 relative z-10">Pro Tip</p>
            <p className="text-sm text-white/80 font-light leading-relaxed font-display italic relative z-10">
              “Regularly check your pending rituals to ensure no journey is left unanswered.”
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardOverview;
