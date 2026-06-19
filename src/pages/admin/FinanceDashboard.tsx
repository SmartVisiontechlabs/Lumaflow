import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { adminSupabase as supabase } from '../../lib/supabase';

interface FinanceStats {
  revenue: {
    today: number;
    month: number;
    year: number;
    total: number;
    previousMonth: number;
    growthPercent: number;
  };
  bookings: {
    upcoming: number;
    completed: number;
    cancelled: number;
  };
  clients: {
    total: number;
    active: number;
    returning: number;
  };
  monthlyAnalytics: {
    month: string;
    revenue: number;
  }[];
  membershipAnalytics?: {
    activePackagesCount: number;
    expiredPackagesCount: number;
    creditsUsed: number;
    creditsRemaining: number;
    packageRevenue: number;
  };
}

// Chart subcomponent
const MonthlyRevenueChart = ({ data }: { data: { month: string; revenue: number }[] }) => {
  if (!data || data.length === 0) return null;

  const maxRevenue = Math.max(...data.map(d => d.revenue), 100);
  const chartHeight = 180;
  const chartWidth = 500;
  const padding = 40;
  
  const graphHeight = chartHeight - padding * 2;
  const graphWidth = chartWidth - padding * 2;

  // Format currency helper
  const formatChartVal = (val: number) => {
    if (val >= 1000) {
      return `$${(val / 1000).toFixed(1)}k`;
    }
    return `$${val}`;
  };
  
  return (
    <div className="w-full bg-white/40 backdrop-blur-xl border border-text-dark/5 p-8 rounded-[2.5rem] shadow-luxury">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="text-sm font-bold text-text-dark tracking-wide uppercase">Revenue Growth Trend</h4>
          <p className="text-[10px] text-text-dark/40 uppercase tracking-widest mt-0.5">Last 6 Months historical data</p>
        </div>
        <span className="text-[9px] font-bold text-gold uppercase tracking-[0.2em] px-3 py-1 bg-cream rounded-full">
          6-Month History
        </span>
      </div>

      <div className="relative w-full h-[220px]">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full">
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#CBAE73" stopOpacity="1" />
              <stop offset="100%" stopColor="#CBAE73" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = padding + graphHeight * (1 - ratio);
            const value = Math.round(maxRevenue * ratio);
            return (
              <g key={idx}>
                <line 
                  x1={padding} 
                  y1={y} 
                  x2={chartWidth - padding} 
                  y2={y} 
                  stroke="#EBE6DD" 
                  strokeWidth="0.5" 
                  strokeDasharray="4 4"
                />
                <text 
                  x={padding - 8} 
                  y={y + 3} 
                  fill="#1C1C1C" 
                  opacity="0.3" 
                  fontSize="8" 
                  textAnchor="end"
                  fontFamily="sans-serif"
                >
                  {formatChartVal(value)}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((item, idx) => {
            const barWidth = 32;
            const gap = (graphWidth - barWidth * data.length) / (data.length - 1);
            const x = padding + idx * (barWidth + gap);
            const ratio = item.revenue / maxRevenue;
            const barHeight = graphHeight * ratio;
            const y = padding + graphHeight - barHeight;

            return (
              <g key={idx} className="group">
                {/* Visual Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="url(#barGradient)"
                  rx="6"
                  className="transition-all duration-300 group-hover:fill-[#CBAE73] cursor-pointer"
                />
                
                {/* Revenue Label on Top */}
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  fill="#1C1C1C"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  ${item.revenue}
                </text>

                {/* X Axis Label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - padding + 16}
                  fill="#1C1C1C"
                  opacity="0.5"
                  fontSize="8"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {item.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default function FinanceDashboard() {
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFinanceData = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const headers = { 'Authorization': `Bearer ${session.access_token}` };
        const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';
        const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

        const res = await fetch(`${API_URL}/admin/finance`, { headers });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Error fetching admin finance data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinanceData();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const isGrowthPositive = stats.revenue.growthPercent >= 0;

  return (
    <div className="space-y-12 pb-24 text-left">
      
      {/* Financial KPIs */}
      <div className="space-y-6">
        <h3 className="text-xl font-display text-text-dark font-light tracking-tight px-4">Financial Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card 1: Revenue Today */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/40 backdrop-blur-xl border border-text-dark/5 p-8 rounded-[2.5rem] shadow-luxury hover:bg-white transition-all duration-700"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-cream rounded-2xl text-gold">
                <DollarSign className="w-5.5 h-5.5" style={{ color: '#CBAE73' }} />
              </div>
              <span className="text-[9px] font-bold text-text-dark/40 uppercase tracking-widest">Today</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-text-dark/20 mb-2">Revenue Today</p>
            <h3 className="text-3xl font-display text-text-dark font-light">{formatCurrency(stats.revenue.today)}</h3>
          </motion.div>

          {/* Card 2: Revenue Month */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/40 backdrop-blur-xl border border-text-dark/5 p-8 rounded-[2.5rem] shadow-luxury hover:bg-white transition-all duration-700"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-cream rounded-2xl text-gold">
                <TrendingUp className="w-5 h-5 text-gold" style={{ color: '#CBAE73' }} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${isGrowthPositive ? 'text-green-500' : 'text-red-400'}`}>
                {isGrowthPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(stats.revenue.growthPercent)}%
              </div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-text-dark/20 mb-2">Revenue Month</p>
            <h3 className="text-3xl font-display text-text-dark font-light">{formatCurrency(stats.revenue.month)}</h3>
          </motion.div>

          {/* Card 3: Revenue Year */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/40 backdrop-blur-xl border border-text-dark/5 p-8 rounded-[2.5rem] shadow-luxury hover:bg-white transition-all duration-700"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-cream rounded-2xl text-gold">
                <Calendar className="w-5 h-5" style={{ color: '#CBAE73' }} />
              </div>
              <span className="text-[9px] font-bold text-text-dark/40 uppercase tracking-widest">Yearly</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-text-dark/20 mb-2">Revenue Year</p>
            <h3 className="text-3xl font-display text-text-dark font-light">{formatCurrency(stats.revenue.year)}</h3>
          </motion.div>

          {/* Card 4: Total Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/40 backdrop-blur-xl border border-text-dark/5 p-8 rounded-[2.5rem] shadow-luxury hover:bg-white transition-all duration-700"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-cream rounded-2xl text-gold">
                <DollarSign className="w-5.5 h-5.5" style={{ color: '#CBAE73' }} />
              </div>
              <span className="text-[9px] font-bold text-text-dark/40 uppercase tracking-widest">All Time</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-text-dark/20 mb-2">Total Revenue</p>
            <h3 className="text-3xl font-display text-text-dark font-light">{formatCurrency(stats.revenue.total)}</h3>
          </motion.div>
        </div>
      </div>

      {/* SVG Bar Chart and secondary statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left 2 Cols: Monthly growth Trend Chart */}
        <div className="lg:col-span-2">
          <MonthlyRevenueChart data={stats.monthlyAnalytics} />
        </div>

        {/* Right 1 Col: Booking & Client Insights */}
        <div className="space-y-8">
          {/* Booking Analytics */}
          <div className="bg-white/40 backdrop-blur-xl border border-text-dark/5 p-8 rounded-[2.5rem] shadow-luxury space-y-6">
            <div>
              <h4 className="text-sm font-bold text-text-dark tracking-wide uppercase">Booking Metrics</h4>
              <p className="text-[10px] text-text-dark/40 uppercase tracking-widest mt-0.5">Somatic session distribution</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-cream/40 rounded-2xl border border-text-dark/5">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gold" style={{ color: '#CBAE73' }} />
                  <span className="text-xs font-semibold text-text-dark/85">Upcoming confirmed</span>
                </div>
                <span className="text-sm font-bold font-mono text-text-dark">{stats.bookings.upcoming}</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-cream/40 rounded-2xl border border-text-dark/5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-semibold text-text-dark/85">Completed sessions</span>
                </div>
                <span className="text-sm font-bold font-mono text-text-dark">{stats.bookings.completed}</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-cream/40 rounded-2xl border border-text-dark/5">
                <div className="flex items-center gap-3">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-semibold text-text-dark/85">Cancelled releases</span>
                </div>
                <span className="text-sm font-bold font-mono text-text-dark">{stats.bookings.cancelled}</span>
              </div>
            </div>
          </div>

          {/* Client Analytics */}
          <div className="bg-white/40 backdrop-blur-xl border border-text-dark/5 p-8 rounded-[2.5rem] shadow-luxury space-y-6">
            <div>
              <h4 className="text-sm font-bold text-text-dark tracking-wide uppercase">Client Metrics</h4>
              <p className="text-[10px] text-text-dark/40 uppercase tracking-widest mt-0.5">Registered member database</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-dark/50 uppercase tracking-wider font-semibold">Total profiles</span>
                <span className="text-base font-bold font-mono text-text-dark">{stats.clients.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-dark/50 uppercase tracking-wider font-semibold">Active clients (≥ 1 session)</span>
                <span className="text-base font-bold font-mono text-text-dark">{stats.clients.active}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-dark/50 uppercase tracking-wider font-semibold">Returning clients (≥ 2 sessions)</span>
                <span className="text-base font-bold font-mono text-[#CBAE73]">{stats.clients.returning}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Membership & Credit Analytics */}
      {stats.membershipAnalytics && (
        <div className="space-y-6">
          <h3 className="text-xl font-display text-text-dark font-light tracking-tight px-4">Membership & Credit Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1: Active Packages */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/40 backdrop-blur-xl border border-text-dark/5 p-8 rounded-[2.5rem] shadow-luxury hover:bg-white transition-all duration-700"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-cream rounded-2xl text-gold">
                  <CheckCircle2 className="w-5.5 h-5.5" style={{ color: '#CBAE73' }} />
                </div>
                <span className="text-[9px] font-bold text-text-dark/40 uppercase tracking-widest">Active</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-text-dark/20 mb-2">Active Journeys</p>
              <h3 className="text-3xl font-display text-text-dark font-light">{stats.membershipAnalytics.activePackagesCount}</h3>
            </motion.div>

            {/* Card 2: Credits Used */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/40 backdrop-blur-xl border border-text-dark/5 p-8 rounded-[2.5rem] shadow-luxury hover:bg-white transition-all duration-700"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-cream rounded-2xl text-gold">
                  <TrendingUp className="w-5 h-5" style={{ color: '#CBAE73' }} />
                </div>
                <span className="text-[9px] font-bold text-text-dark/40 uppercase tracking-widest">Used</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-text-dark/20 mb-2">Credits Consumed</p>
              <h3 className="text-3xl font-display text-text-dark font-light">{stats.membershipAnalytics.creditsUsed}</h3>
            </motion.div>

            {/* Card 3: Credits Remaining */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/40 backdrop-blur-xl border border-text-dark/5 p-8 rounded-[2.5rem] shadow-luxury hover:bg-white transition-all duration-700"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-cream rounded-2xl text-gold">
                  <Clock className="w-5 h-5" style={{ color: '#CBAE73' }} />
                </div>
                <span className="text-[9px] font-bold text-text-dark/40 uppercase tracking-widest">Unused</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-text-dark/20 mb-2">Credits Remaining</p>
              <h3 className="text-3xl font-display text-gold font-light">{stats.membershipAnalytics.creditsRemaining}</h3>
            </motion.div>

            {/* Card 4: Package Revenue */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/40 backdrop-blur-xl border border-text-dark/5 p-8 rounded-[2.5rem] shadow-luxury hover:bg-white transition-all duration-700"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-cream rounded-2xl text-gold">
                  <DollarSign className="w-5.5 h-5.5" style={{ color: '#CBAE73' }} />
                </div>
                <span className="text-[9px] font-bold text-text-dark/40 uppercase tracking-widest">Journeys</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-text-dark/20 mb-2">Package Revenue</p>
              <h3 className="text-3xl font-display text-text-dark font-light">{formatCurrency(stats.membershipAnalytics.packageRevenue)}</h3>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
