import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, LiveBooking } from '../../providers/AuthProvider';
import { 
  Calendar, 
  Clock, 
  Video, 
  Compass, 
  Sparkles,
  CreditCard,
  History,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ChevronDown,
  Info
} from 'lucide-react';
import { fromZonedTime } from 'date-fns-tz';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { trackDashboardVisit } from '../../lib/analytics';

// Helper to calculate Google Calendar Link
function getGoogleCalendarUrl(booking: LiveBooking) {
  try {
    const dateStr = booking.selected_date;
    const timeStr = booking.selected_time;
    const tz = booking.timezone || 'America/New_York';
    const startUTC = fromZonedTime(`${dateStr}T${timeStr}:00`, tz);
    const duration = Number(booking.duration || 60);
    const endUTC = new Date(startUTC.getTime() + duration * 60 * 1000);

    const formatUTC = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const dates = `${formatUTC(startUTC)}/${formatUTC(endUTC)}`;
    const text = encodeURIComponent(`LumaFlow: ${booking.selected_session}`);
    
    const isVirtual = booking.session_format?.toLowerCase() === 'virtual';
    const locationStr = isVirtual 
      ? (booking.zoom_join_url || 'Zoom link details to be sent')
      : 'LumaFlow Sanctuary, Soho, Manhattan, NY';

    const rawDetails = isVirtual ? `
Client: ${booking.full_name || 'Valued Guest'}
Ritual: ${booking.selected_session}
Reference: ${booking.booking_reference}

Zoom Join Link: ${booking.zoom_join_url || 'Provisioning details will be sent shortly'}
Meeting ID: ${booking.zoom_meeting_id || 'N/A'}
Password: ${booking.meeting_password || 'N/A'}

Preparation Checklist:
- Find a quiet, private space
- Water/herbal tea nearby
- Comfortable, loose clothing
- High-quality headphones recommended
- Test your internet and camera setup
`.trim() : `
Client: ${booking.full_name || 'Valued Guest'}
Ritual: ${booking.selected_session}
Reference: ${booking.booking_reference}

Location: LumaFlow Sanctuary • Soho, Manhattan, NY

Preparation Checklist:
- Wear loose-fitting clothing
- Arrive 10 minutes early to settle in
- Refrain from heavy meals 2h prior
- Press the LumaFlow buzzer at the entrance
`.trim();

    const details = encodeURIComponent(rawDetails);
    const location = encodeURIComponent(locationStr);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
  } catch (err) {
    console.error('Error generating Google Calendar URL:', err);
    return '#';
  }
}

export default function Dashboard() {
  const { bookings, loading: authLoading, profile } = useAuth();
  
  // API fetched states
  const [upcomingBooking, setUpcomingBooking] = useState<LiveBooking | null>(null);
  const [stats, setStats] = useState({ completedRituals: 0, remainingCredits: 0, upcomingBookings: 0 });
  const [apiLoading, setApiLoading] = useState(true);

  // Countdown timers
  const [countdown, setCountdown] = useState<string>('');
  const [canJoin, setCanJoin] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [rescheduleMessage, setRescheduleMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setApiLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        trackDashboardVisit(session.user.id);

        const headers = { 'Authorization': `Bearer ${session.access_token}` };
        const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';
        const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

        const [upcomingRes, statsRes] = await Promise.all([
          fetch(`${API_URL}/client/upcoming-booking`, { headers }),
          fetch(`${API_URL}/client/journey-stats`, { headers })
        ]);

        if (upcomingRes.ok) {
          const upcomingData = await upcomingRes.json();
          setUpcomingBooking(upcomingData.upcomingBooking);
        }
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (err) {
        console.error('[Dashboard] Error loading API data:', err);
      } finally {
        setApiLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Ticking countdown timer logic
  useEffect(() => {
    if (!upcomingBooking) {
      setCountdown('');
      setCanJoin(false);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const tz = upcomingBooking.timezone || 'America/New_York';
      const startUTC = fromZonedTime(`${upcomingBooking.selected_date}T${upcomingBooking.selected_time}:00`, tz);
      const timeDiff = startUTC.getTime() - now.getTime();
      const durationMs = (upcomingBooking.duration || 60) * 60 * 1000;

      // Can join within 15 minutes of start, or during the session
      const isWithin15Mins = timeDiff > 0 && timeDiff <= 15 * 60 * 1000;
      const isOngoing = timeDiff <= 0 && Math.abs(timeDiff) <= durationMs;
      setCanJoin(isWithin15Mins || isOngoing);

      if (isOngoing) {
        setCountdown('Ritual Journey In Progress');
      } else if (timeDiff < 0) {
        setCountdown('Ritual Concluded');
        clearInterval(interval);
      } else {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((timeDiff % (1000 * 60)) / (1000 * 60));
        const secs = Math.floor((timeDiff % (1000 * 60)) / 1000);

        let parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0 || days > 0) parts.push(`${hours}h`);
        parts.push(`${mins}m`);
        parts.push(`${secs}s`);
        
        setCountdown(`Commencing in: ${parts.join(' ')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [upcomingBooking]);

  const handleRescheduleClick = () => {
    setRescheduleMessage(
      'Sanctuary rescheduling is managed with care. Please contact us at support@thelumaflow.com or through our contact page to reschedule your appointed ritual.'
    );
    setTimeout(() => setRescheduleMessage(null), 8000);
  };

  const formatBookingDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMMM d, yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  const formatBookingTime = (timeStr: string) => {
    try {
      const [h, m] = timeStr.split(':');
      const hour = parseInt(h);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${m} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };

  if (authLoading || apiLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  // Filter completed and past bookings for the Ritual Chronology
  const pastBookings = bookings.filter((b) => {
    if (b.booking_status === 'cancelled') return true;
    if (upcomingBooking && b.id === upcomingBooking.id) return false;
    const tz = b.timezone || 'America/New_York';
    const startUTC = fromZonedTime(`${b.selected_date}T${b.selected_time}:00`, tz);
    const durationMs = (b.duration || 60) * 60 * 1000;
    return startUTC.getTime() + durationMs <= new Date().getTime();
  });

  const timelineItems = pastBookings.map((pb) => ({
    ritualName: pb.selected_session,
    date: pb.selected_date,
    time: pb.selected_time,
    format: pb.session_format,
    isCompleted: pb.booking_status === 'completed',
    isCancelled: pb.booking_status === 'cancelled'
  }));

  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'Member';

  // State Chips Helper
  const getChipStyle = (item: typeof timelineItems[0]) => {
    if (item.isCancelled) {
      return "bg-red-500/5 border border-red-500/20 text-red-400 text-[8px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full";
    }
    return "bg-[#CBAE73]/5 border border-[#CBAE73]/15 text-[#CBAE73]/70 text-[8px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full";
  };

  const getChipLabel = (item: typeof timelineItems[0]) => {
    if (item.isCancelled) return "Sanctuary Released";
    return "Restoration Complete";
  };

  return (
    <div className="space-y-12 pb-24 pt-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Welcome Greeting Header */}
      <div className="text-left space-y-2">
        <h2 className="font-display text-4xl sm:text-5xl text-text-dark tracking-tight font-light">
          Settle in, <span className="italic text-gold font-normal">{firstName}</span>
        </h2>
        <p className="text-xs text-text-dark/40 font-light font-sans tracking-wide">
          Welcome to your sanctuary portal. Quiet the noise and align your energies.
        </p>
      </div>

      {/* FEATURE 1: Upcoming Ritual Card at the very top */}
      <div className="w-full">
        {upcomingBooking ? (
          <div className="bg-white/40 border border-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-10 shadow-luxury relative overflow-hidden text-left">
            <div className="absolute top-[-30%] right-[-10%] w-[400px] h-[400px] bg-gold/5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-8">
              {/* Left Column: Ritual metadata */}
              <div className="space-y-6 flex-1">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-gold/80 uppercase tracking-[0.3em]">
                    Upcoming Ritual
                  </span>
                  <h3 className="font-display text-3xl sm:text-4xl text-text-dark tracking-tight leading-tight font-light">
                    {upcomingBooking.selected_session}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-text-dark/30">Date</p>
                    <p className="text-sm text-text-dark/80 font-semibold">{formatBookingDate(upcomingBooking.selected_date)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-text-dark/30">Time</p>
                    <p className="text-sm text-text-dark/80 font-semibold">{formatBookingTime(upcomingBooking.selected_time)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-text-dark/30">Timezone</p>
                    <p className="text-sm text-text-dark/60 font-semibold">{upcomingBooking.timezone || 'America/New_York'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-text-dark/30">Format</p>
                    <p className="text-sm text-text-dark/60 font-semibold">
                      {upcomingBooking.session_format.toLowerCase() === 'virtual' ? 'Virtual Experience' : 'In-Person Experience'}
                    </p>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="flex items-center gap-3.5 pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-[#CBAE73]/10 border border-[#CBAE73]/30 text-gold shadow-[0_0_10px_rgba(203,174,115,0.1)]">
                    Confirmed
                  </span>
                  <span className="text-[10px] text-text-dark/40 font-light italic">
                    "{countdown}"
                  </span>
                </div>
              </div>

              {/* Right Column: Dynamic Action Buttons */}
              <div className="flex flex-col gap-3 min-w-[200px] w-full lg:w-auto self-stretch lg:self-start justify-center">
                {upcomingBooking.session_format.toLowerCase() === 'virtual' && upcomingBooking.zoom_join_url && (
                  <a
                    href={canJoin ? upcomingBooking.zoom_join_url : undefined}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "w-full py-4.5 px-8 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2.5 transition-all duration-700 relative overflow-hidden group border",
                      canJoin 
                        ? 'bg-text-dark text-white border-text-dark hover:bg-gold hover:text-black cursor-pointer shadow-luxury' 
                        : 'bg-white/30 text-text-dark/25 border-text-dark/5 cursor-not-allowed'
                    )}
                  >
                    <Video className={cn("w-4 h-4", canJoin ? "text-gold animate-pulse" : "text-text-dark/10")} />
                    Join Session
                    {canJoin && (
                      <span className="absolute inset-0 border border-gold/30 rounded-2xl animate-ping opacity-50 pointer-events-none" />
                    )}
                  </a>
                )}
                
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full py-4 px-8 bg-white/60 hover:bg-white text-text-dark/60 hover:text-text-dark border border-text-dark/5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2 transition-all duration-500 shadow-soft"
                >
                  <span>View Details</span>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-gold transition-transform duration-500", showDetails && "rotate-180")} />
                </button>

                <button
                  onClick={handleRescheduleClick}
                  className="w-full py-4 px-8 bg-white/40 hover:bg-white/60 text-text-dark/40 hover:text-text-dark/60 border border-text-dark/5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-500"
                >
                  Reschedule
                </button>

                <a
                  href={getGoogleCalendarUrl(upcomingBooking)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 px-8 text-center text-text-dark/40 hover:text-gold text-[9px] font-semibold uppercase tracking-widest transition-colors duration-300"
                >
                  + Sync Google Calendar
                </a>
              </div>
            </div>

            {/* Expandable Details Area */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden border-t border-text-dark/5 mt-8 pt-8"
                >
                  <div className="grid md:grid-cols-2 gap-8 text-xs text-text-dark/60 leading-relaxed font-medium">
                    <div className="space-y-4">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold/80">Sanctuary Instructions</p>
                      {upcomingBooking.session_format.toLowerCase() === 'virtual' ? (
                        <ul className="list-disc pl-4 space-y-2">
                          <li>Find a quiet space where you will not be disturbed for {upcomingBooking.duration} minutes.</li>
                          <li>Wear loose-fitting, warm, and comfortable clothing.</li>
                          <li>Have a glass of water or hot herbal tea close to your sanctuary mat.</li>
                          <li>We recommend using high-quality over-ear headphones to fully receive the sound vibrations.</li>
                          <li>Please test your internet connection and video setup 10 minutes prior to session start.</li>
                        </ul>
                      ) : (
                        <ul className="list-disc pl-4 space-y-2">
                          <li>Please wear loose-fitting, comfortable clothing suitable for breathing and laying down.</li>
                          <li>Kindly arrive 10 minutes before your appointment time to settle your energy in the lounge.</li>
                          <li>Avoid heavy meals or caffeine for at least 2 hours prior to your scheduled ritual.</li>
                          <li>Press the LumaFlow sanctuary buzzer at the entrance of our Soho location.</li>
                        </ul>
                      )}
                    </div>

                    <div className="space-y-4 bg-white/20 p-6 rounded-2xl border border-text-dark/5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold/80">Credentials & Details</p>
                      <div className="space-y-2 font-mono text-[11px]">
                        <p>Reference: {upcomingBooking.booking_reference}</p>
                        <p>Ritual: {upcomingBooking.selected_session}</p>
                        <p>Duration: {upcomingBooking.duration} Minutes</p>
                        <p>Location: {upcomingBooking.session_format.toLowerCase() === 'virtual' ? 'Virtual (Zoom Client)' : 'LumaFlow Soho Sanctuary'}</p>
                        {upcomingBooking.session_format.toLowerCase() === 'virtual' && upcomingBooking.zoom_meeting_id && (
                          <>
                            <p className="border-t border-text-dark/5 pt-2 mt-2">Meeting ID: {upcomingBooking.zoom_meeting_id}</p>
                            <p>Password: {upcomingBooking.meeting_password || 'N/A'}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reschedule Message Notification */}
            <AnimatePresence>
              {rescheduleMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-6 p-4 bg-white/60 border border-gold/20 rounded-2xl flex items-start gap-3 shadow-soft"
                >
                  <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <p className="text-xs text-text-dark/70 font-medium leading-relaxed">
                    {rescheduleMessage}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white/40 border border-white/60 backdrop-blur-xl rounded-[2.5rem] p-12 shadow-luxury text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-[-30%] right-[-10%] w-[300px] h-[300px] bg-gold/5 blur-[80px] rounded-full pointer-events-none" />
            <Sparkles className="w-8 h-8 text-gold/40 mx-auto" />
            <p className="text-sm text-text-dark/60 font-light tracking-wide italic">
              Your next ritual has not yet been scheduled.
            </p>
            <Link
              to="/book"
              className="inline-flex py-4 px-10 bg-[#CBAE73] hover:bg-[#CBAE73]/90 text-black rounded-full text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-500 shadow-luxury"
            >
              Book A Session
            </Link>
          </div>
        )}
      </div>

      {/* FEATURE 2: Journey Statistics Card directly below Upcoming Session */}
      <div className="space-y-6 text-left">
        <h3 className="font-display text-2xl text-text-dark font-light tracking-tight">Your Journey</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Completed Rituals */}
          <div className="bg-white/40 border border-white/60 p-8 rounded-[2rem] shadow-luxury flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
            <div className="absolute top-[-20%] right-[-10%] w-[120px] h-[120px] bg-gold/5 blur-[35px] rounded-full pointer-events-none" />
            <span className="text-[9px] font-bold text-text-dark/40 uppercase tracking-[0.2em]">
              Completed Rituals
            </span>
            <div className="flex justify-between items-end mt-4">
              <span className="text-5xl font-display text-text-dark leading-none font-light">
                {stats.completedRituals}
              </span>
              <CheckCircle className="w-6 h-6 text-gold/40" />
            </div>
            <p className="text-[9px] font-semibold text-text-dark/30 uppercase tracking-wider mt-3">
              Total somatic completions
            </p>
          </div>

          {/* Card 2: Remaining Credits */}
          <div className="bg-white/40 border border-white/60 p-8 rounded-[2rem] shadow-luxury flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
            <div className="absolute top-[-20%] right-[-10%] w-[120px] h-[120px] bg-gold/5 blur-[35px] rounded-full pointer-events-none" />
            <span className="text-[9px] font-bold text-text-dark/40 uppercase tracking-[0.2em]">
              Remaining Credits
            </span>
            <div className="flex justify-between items-end mt-4">
              <span className="text-5xl font-display text-text-dark leading-none font-light">
                {stats.remainingCredits}
              </span>
              <CreditCard className="w-6 h-6 text-gold/40" />
            </div>
            <p className="text-[9px] font-semibold text-text-dark/30 uppercase tracking-wider mt-3">
              Sanctuary balances ready to book
            </p>
          </div>

          {/* Card 3: Upcoming Rituals */}
          <div className="bg-white/40 border border-white/60 p-8 rounded-[2rem] shadow-luxury flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
            <div className="absolute top-[-20%] right-[-10%] w-[120px] h-[120px] bg-gold/5 blur-[35px] rounded-full pointer-events-none" />
            <span className="text-[9px] font-bold text-text-dark/40 uppercase tracking-[0.2em]">
              Upcoming Rituals
            </span>
            <div className="flex justify-between items-end mt-4">
              <span className="text-5xl font-display text-text-dark leading-none font-light">
                {stats.upcomingBookings}
              </span>
              <Calendar className="w-6 h-6 text-gold/40" />
            </div>
            <p className="text-[9px] font-semibold text-text-dark/30 uppercase tracking-wider mt-3">
              Appointed upcoming journeys
            </p>
          </div>
        </div>
      </div>

      {/* 3. Ritual Chronology and Sub-Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Past Ritual Chronology (7 cols) */}
        <div className="lg:col-span-7 bg-white/30 border border-white/60 p-8 sm:p-10 rounded-[2.5rem] shadow-luxury backdrop-blur-md space-y-6">
          <div className="space-y-1 text-left flex justify-between items-center">
            <div>
              <h3 className="font-display text-2xl text-text-dark tracking-tight font-light">Ritual Chronology</h3>
              <p className="text-xs text-text-dark/40 font-light mt-0.5">Your progress through the LumaFlow transformation paths.</p>
            </div>
            <History className="w-5 h-5 text-gold/40" />
          </div>

          <div className="space-y-4 custom-scrollbar max-h-[460px] overflow-y-auto pr-2">
            {timelineItems.length > 0 ? (
              timelineItems.map((item, idx) => (
                <div 
                  key={idx} 
                  className="bg-white/40 border border-white/60 p-5 rounded-2xl hover:shadow-luxury transition-all duration-300 flex flex-col gap-3.5 text-left group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h4 className={cn(
                      "text-xs font-bold text-text-dark/80 group-hover:text-text-dark transition-colors duration-300", 
                      item.isCancelled && "line-through opacity-50"
                    )}>
                      {item.ritualName}
                    </h4>
                    <span className={getChipStyle(item)}>
                      {getChipLabel(item)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-gold/5 pt-3.5 text-[9px] text-text-dark/40 font-medium">
                    <span>{formatBookingDate(item.date)}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gold/60" />
                      {formatBookingTime(item.time)} ({item.format})
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <p className="text-xs text-text-dark/30 italic">No ritual history found. Reserve your first session to begin the timeline.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Healing Sanctuary Guide (5 cols) */}
        <div className="lg:col-span-5 bg-white/30 border border-white/60 p-8 sm:p-10 rounded-[2.5rem] shadow-luxury backdrop-blur-md space-y-6">
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center">
              <Compass className="w-4 h-4 text-gold animate-breathe" />
            </div>
            <h3 className="font-display text-2xl text-text-dark tracking-tight font-light">Sanctuary Compass</h3>
          </div>
          
          <div className="space-y-4 text-xs text-text-dark/70 leading-relaxed font-medium text-left">
            <p>
              Your dashboard aggregates all booking references and active credits. You can always view completed somatic breathwork sessions and payments directly in the portal.
            </p>
            <p>
              If your next session is Virtual, the <strong>Join Session</strong> button will activate 15 minutes prior to the appointed hour. Please check your audio headphones and device compatibility beforehand.
            </p>
            <p>
              If your next session is In-Person, we request that you arrive at our Soho Lounge 10 minutes early to settle in and enjoy a warm herbal tea before your ritual begins.
            </p>
          </div>

          <div className="pt-6 border-t border-text-dark/5 flex flex-col gap-3">
            <Link
              to="/book"
              className="w-full py-4.5 px-6 bg-text-dark hover:bg-gold text-white text-center rounded-xl text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-500 shadow-button"
            >
              Book New Session
            </Link>
            <a
              href="/pricing"
              className="w-full py-4 px-6 bg-white/50 hover:bg-white text-text-dark/60 text-center rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 border border-text-dark/5 shadow-soft"
            >
              Explore Packages
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
