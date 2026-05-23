import { useEffect, useState } from 'react';
import { useAuth, LiveBooking } from '../../providers/AuthProvider';
import { 
  Calendar, 
  Clock, 
  Video, 
  Award, 
  Sparkles,
  HelpCircle,
  ExternalLink,
  Compass,
  Check,
  ArrowRight
} from 'lucide-react';
import { fromZonedTime } from 'date-fns-tz';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

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

// Custom Premium SVG Progress Ring Component
const ProgressRing = ({ value, max }: { value: number; max: number }) => {
  const size = 160;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = max > 0 ? circumference - (value / max) * circumference : circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={size}
        width={size}
        className="transform -rotate-90 filter drop-shadow-[0_0_12px_rgba(203,174,115,0.15)]"
      >
        {/* Background track circle */}
        <circle
          stroke="rgba(203, 174, 115, 0.08)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Foreground animated value circle */}
        <motion.circle
          stroke="#CBAE73"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-5xl font-display text-text-dark tracking-tighter font-light">
          {value}
        </span>
        <span className="text-[8px] font-bold text-text-dark/30 uppercase tracking-[0.25em] mt-1">
          of {max} remaining
        </span>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { bookings, membership, upcomingBooking, remainingCredits, loading, profile } = useAuth();
  const [countdown, setCountdown] = useState<string>('');
  const [countdownHero, setCountdownHero] = useState<string>('');
  const [canJoin, setCanJoin] = useState(false);

  // Ticking countdown timer logic
  useEffect(() => {
    if (!upcomingBooking) {
      setCountdown('');
      setCountdownHero('');
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
        setCountdownHero('Ritual In Progress');
      } else if (timeDiff < 0) {
        setCountdown('Ritual Concluded');
        setCountdownHero('Ritual Concluded');
        clearInterval(interval);
      } else {
        // Calculate days, hours, mins, secs
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((timeDiff % (1000 * 60)) / 1000);

        let parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0 || days > 0) parts.push(`${hours}h`);
        parts.push(`${mins}m`);
        parts.push(`${secs}s`);
        
        setCountdown(`Commencing in: ${parts.join(' ')}`);

        // Hero clean countdown format e.g. "2 Days • 4 Hours" or "4 Hours • 12 Mins"
        let heroParts = [];
        if (days > 0) {
          heroParts.push(`${days} Day${days > 1 ? 's' : ''}`);
        }
        if (hours > 0 || days > 0) {
          heroParts.push(`${hours} Hour${hours > 1 ? 's' : ''}`);
        }
        if (days === 0 && hours === 0) {
          heroParts.push(`${mins} Min${mins > 1 ? 's' : ''}`);
        }
        setCountdownHero(heroParts.slice(0, 2).join(' • '));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [upcomingBooking]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  // Filter completed and past bookings for the Ritual Journey Timeline
  const pastBookings = bookings.filter((b) => {
    if (b.booking_status === 'cancelled') return true;
    if (upcomingBooking && b.id === upcomingBooking.id) return false;
    const tz = b.timezone || 'America/New_York';
    const startUTC = fromZonedTime(`${b.selected_date}T${b.selected_time}:00`, tz);
    const durationMs = (b.duration || 60) * 60 * 1000;
    return startUTC.getTime() + durationMs <= new Date().getTime();
  });

  // Construct Timeline Items
  const timelineItems: Array<{
    ritualName: string;
    date: string;
    time: string;
    format: string;
    isUpcoming: boolean;
    isCompleted: boolean;
    isCancelled: boolean;
  }> = [];

  if (upcomingBooking) {
    timelineItems.push({
      ritualName: upcomingBooking.selected_session,
      date: upcomingBooking.selected_date,
      time: upcomingBooking.selected_time,
      format: upcomingBooking.session_format,
      isUpcoming: true,
      isCompleted: false,
      isCancelled: false
    });
  }

  pastBookings.forEach((pb) => {
    timelineItems.push({
      ritualName: pb.selected_session,
      date: pb.selected_date,
      time: pb.selected_time,
      format: pb.session_format,
      isUpcoming: false,
      isCompleted: pb.booking_status === 'completed',
      isCancelled: pb.booking_status === 'cancelled'
    });
  });

  // Total credits from membership definition
  const totalCreditsPossible = membership ? membership.total_credits : 10; // fallback default
  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'Member';

  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. Welcome Hero Section */}
      <div className="relative bg-white/40 border border-white/60 p-10 lg:p-14 rounded-[3.5rem] shadow-luxury overflow-hidden backdrop-blur-md">
        <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-gold/5 blur-[90px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
          <div className="space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-gold/10 border border-gold/10 rounded-full">
              <Sparkles className="w-3 h-3 text-gold" />
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-gold-light select-none">
                Your Sanctuary Awaits
              </span>
            </div>
            
            <h1 className="font-display text-4xl sm:text-6xl text-text-dark tracking-tight leading-none">
              Welcome back, <br />
              <span className="italic text-[#CBAE73] font-normal">{firstName}</span>
            </h1>

            <p className="text-sm font-light text-text-dark/50 leading-relaxed font-body">
              Step into a space of high-frequency restoration. Below is your current alignment status and upcoming chronologies.
            </p>

            {upcomingBooking && countdownHero && (
              <div className="pt-2 flex items-center gap-4 text-xs font-bold text-text-dark/40 uppercase tracking-widest">
                <span>Next Ritual:</span>
                <span className="text-gold font-display font-medium text-lg tracking-normal">
                  {countdownHero}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 min-w-[260px] w-full lg:w-auto">
            {upcomingBooking ? (
              <>
                {upcomingBooking.session_format.toLowerCase() === 'virtual' ? (
                  <a
                    href={canJoin ? upcomingBooking.zoom_join_url : undefined}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "w-full py-6 px-10 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all duration-700 relative overflow-hidden group shadow-luxury border",
                      canJoin 
                        ? 'bg-text-dark text-white border-text-dark hover:bg-gold hover:text-black cursor-pointer animate-pulse' 
                        : 'bg-white/40 text-text-dark/25 border-text-dark/5 cursor-not-allowed'
                    )}
                  >
                    <Video className={cn("w-4 h-4", canJoin ? "text-gold" : "text-text-dark/20")} />
                    Enter Sanctuary
                    {canJoin && (
                      <span className="absolute inset-0 border border-gold/40 rounded-2xl animate-ping opacity-60" />
                    )}
                  </a>
                ) : (
                  <div className="w-full py-6 px-10 rounded-2xl bg-white/40 border border-text-dark/5 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 text-text-dark/40 select-none">
                    <Compass className="w-4 h-4 text-gold/60" />
                    Sanctuary In-Person
                  </div>
                )}
                
                <a
                  href={getGoogleCalendarUrl(upcomingBooking)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-5 px-10 bg-white/60 hover:bg-white text-text-dark/60 hover:text-text-dark border border-text-dark/5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all duration-500 shadow-soft"
                >
                  <Calendar className="w-4 h-4 text-gold" />
                  Calendar Sync
                </a>
              </>
            ) : (
              <a
                href="/book"
                className="w-full py-6 px-10 bg-[#CBAE73] text-black rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all duration-700 hover:scale-[1.02] shadow-luxury"
              >
                Book Your Next Ritual
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 2. Content Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Grid: Upcoming & Credits */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Upcoming Session Details Card */}
          {upcomingBooking && (
            <div className="bg-white/40 border border-white/60 p-8 rounded-[2.5rem] shadow-luxury backdrop-blur-md space-y-8">
              <div className="flex justify-between items-center pb-4 border-b border-gold/10">
                <h3 className="font-display text-2xl text-text-dark">Upcoming Appointed Ritual</h3>
                <span className="text-[10px] font-bold text-text-dark/30 uppercase tracking-[0.2em]">
                  Ref: {upcomingBooking.booking_reference}
                </span>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-gold/60">Ritual</p>
                    <p className="font-display text-2xl text-text-dark tracking-tight leading-snug">
                      {upcomingBooking.selected_session}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-xs text-text-dark/60 font-medium">
                      <Calendar className="w-4 h-4 text-gold" />
                      <span>{upcomingBooking.selected_date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-text-dark/60 font-medium">
                      <Clock className="w-4 h-4 text-gold" />
                      <span>{upcomingBooking.selected_time} ({upcomingBooking.timezone})</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-text-dark/60 font-medium">
                      <Award className="w-4 h-4 text-gold" />
                      <span>{upcomingBooking.duration} mins • {upcomingBooking.session_format}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/50 border border-text-dark/5 p-6 rounded-3xl flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold/80">Ritual Timeline</p>
                    <p className="text-xs text-text-dark/50 leading-relaxed font-light italic">
                      "{countdown}"
                    </p>
                  </div>
                  {upcomingBooking.session_format.toLowerCase() === 'virtual' && upcomingBooking.zoom_join_url && (
                    <div className="space-y-1 pt-2 border-t border-text-dark/5 text-[9px] font-medium text-text-dark/40">
                      <p>Meeting ID: {upcomingBooking.zoom_meeting_id || 'N/A'}</p>
                      <p>Password: {upcomingBooking.meeting_password || 'N/A'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Membership Visual Card */}
          <div className="bg-white/40 border border-white/60 p-8 rounded-[2.5rem] shadow-luxury backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[150px] h-[150px] bg-gold/5 blur-[50px] rounded-full pointer-events-none" />
            
            <div className="space-y-6 max-w-sm">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gold/10 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/40">Membership Credits</span>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-display text-2xl text-text-dark tracking-tight">Chronological Balance</h3>
                <p className="text-xs text-text-dark/50 leading-relaxed font-light">
                  Your remaining ritual credits allow you to secure bookings instantly. More credits can be claimed via the pricing investment tiers.
                </p>
              </div>

              <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-text-dark/30 pt-2 border-t border-text-dark/5">
                <span>Total: {totalCreditsPossible}</span>
                <span>Used: {membership ? membership.used_credits : 0}</span>
              </div>
            </div>

            <div className="flex-shrink-0">
              <ProgressRing value={remainingCredits} max={totalCreditsPossible} />
            </div>
          </div>

        </div>

        {/* Right Grid: Journey Timeline */}
        <div className="lg:col-span-5 bg-white/40 border border-white/60 p-8 lg:p-10 rounded-[2.5rem] shadow-luxury backdrop-blur-md space-y-8">
          <div className="space-y-2">
            <h3 className="font-display text-2xl text-text-dark tracking-tight">Ritual Journey Timeline</h3>
            <p className="text-xs text-text-dark/40 font-light">Your progress through the LumaFlow transformation paths.</p>
          </div>

          <div className="relative pl-8 border-l border-gold/15 space-y-10 custom-scrollbar max-h-[520px] overflow-y-auto pr-2">
            {timelineItems.length > 0 ? (
              timelineItems.map((item, idx) => (
                <div key={idx} className="relative group">
                  {/* Circle indicator on timeline */}
                  <div className={cn(
                    "absolute -left-[45px] top-1.5 w-6 h-6 rounded-full border flex items-center justify-center z-10 shadow-sm transition-all duration-700",
                    item.isCompleted 
                      ? "bg-text-dark border-text-dark text-[#CBAE73]" 
                      : item.isUpcoming 
                      ? "bg-white border-[#CBAE73] text-[#CBAE73] scale-110" 
                      : "bg-white border-zinc-200 text-zinc-300"
                  )}>
                    {item.isCompleted ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : item.isCancelled ? (
                      <span className="text-[8px] font-bold">✕</span>
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-current animate-pulse" />
                    )}
                  </div>
                  
                  <div className="space-y-2 text-left">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className={cn(
                        "text-sm font-bold transition-colors duration-500", 
                        item.isUpcoming ? "text-text-dark font-semibold" : "text-text-dark/60 font-medium",
                        item.isCancelled && "line-through opacity-50"
                      )}>
                        {item.ritualName}
                      </h4>
                      {item.isUpcoming && (
                        <span className="px-2 py-0.5 bg-[#CBAE73]/15 text-[#CBAE73] text-[7px] font-bold uppercase tracking-widest rounded-full">
                          Appointed
                        </span>
                      )}
                      {item.isCancelled && (
                        <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[7px] font-bold uppercase tracking-widest rounded-full">
                          Cancelled
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-medium text-text-dark/40">
                      {item.date} • {item.time} • {item.format}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-xs text-text-dark/30 italic">No ritual history found. Reserve your first session to begin the timeline.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
