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
        <span className="text-3xl font-display text-text-dark tracking-tighter font-light">
          {value} / {max}
        </span>
        <span className="text-[8px] font-bold text-[#CBAE73] uppercase tracking-[0.25em] mt-1 font-semibold">
          Remaining
        </span>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { bookings, membership, activePackages, upcomingBooking, remainingCredits, loading, profile } = useAuth();
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

  // Completed and reserved counts
  const completedSessionsCount = bookings.filter(b => b.booking_status === 'completed').length;
  const reservedCount = bookings.filter(b => b.booking_status === 'confirmed').length;
  
  let totalCreditsPossible = 0;
  if (membership) {
    totalCreditsPossible = membership.total_credits;
  } else if (activePackages && activePackages.length > 0) {
    totalCreditsPossible = activePackages.reduce((sum: number, p: any) => sum + (p.total_credits || 0), 0);
  } else {
    totalCreditsPossible = remainingCredits + completedSessionsCount;
  }

  const remainingCount = remainingCredits;
  const progressPercent = totalCreditsPossible > 0 ? Math.round((remainingCount / totalCreditsPossible) * 100) : 0;
  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'Member';

  const activePackagesDetails = (activePackages || []).map(pkgRecord => {
    return {
      id: pkgRecord.id,
      name: bookings.find(b => b.package_id === pkgRecord.package_id)?.package_name || 
            (pkgRecord.package_id === 'ecca0c9b-42c6-4fbe-aec5-a1651ab6a29b' ? '10-Class Package' :
             pkgRecord.package_id === 'e69dfd27-1da5-4584-b410-72b1ea76c48f' ? 'Starter Healing Journey' :
             pkgRecord.package_id === '772407fa-1b48-4f0f-80d5-1b343ada98c1' ? 'Single Session' : 'Active Package'),
      price: bookings.find(b => b.package_id === pkgRecord.package_id)?.package_price ||
             (pkgRecord.package_id === 'ecca0c9b-42c6-4fbe-aec5-a1651ab6a29b' ? 350 :
              pkgRecord.package_id === 'e69dfd27-1da5-4584-b410-72b1ea76c48f' ? 99 :
              pkgRecord.package_id === '772407fa-1b48-4f0f-80d5-1b343ada98c1' ? 45 : 0),
      remaining: pkgRecord.remaining_credits,
      total: pkgRecord.total_credits
    };
  });

  // State Chips Helper
  const getChipStyle = (item: typeof timelineItems[0]) => {
    if (item.isUpcoming) {
      return "bg-[#CBAE73]/10 border border-[#CBAE73]/40 text-[#CBAE73] text-[8px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-[0_0_10px_rgba(203,174,115,0.1)]";
    }
    if (item.isCancelled) {
      return "bg-red-500/5 border border-red-500/20 text-red-400 text-[8px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full";
    }
    return "bg-[#CBAE73]/5 border border-[#CBAE73]/15 text-[#CBAE73]/70 text-[8px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full";
  };

  const getChipLabel = (item: typeof timelineItems[0]) => {
    if (item.isUpcoming) return "Confirmed Sanctuary Session";
    if (item.isCancelled) return "Sanctuary Released";
    return "Restoration Complete";
  };

  return (
    <div className="space-y-16 pb-24 pt-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* 1. Welcome Hero Section */}
      <div className="relative bg-white/30 border border-white/60 p-12 lg:p-20 rounded-[3.5rem] shadow-luxury overflow-hidden backdrop-blur-xl">
        <div className="absolute top-[-30%] right-[-10%] w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-gold/5 blur-[90px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative z-10">
          <div className="space-y-8 max-w-3xl">
            <div className="inline-flex items-center gap-2.5 px-4.5 py-2 bg-gold/10 border border-gold/10 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#CBAE73] select-none">
                Your Sanctuary Awaits
              </span>
            </div>
            
            <h1 className="font-display text-5xl sm:text-7xl text-text-dark tracking-tight leading-[1.05] font-light">
              Settle in, <br />
              <span className="italic text-[#CBAE73] font-normal">{firstName}</span>
            </h1>

            <p className="text-base font-light text-text-dark/50 leading-relaxed max-w-xl">
              Step into a space of high-frequency restoration. Below is your current alignment status and upcoming chronologies.
            </p>

            {upcomingBooking && countdownHero && (
              <div className="pt-2 flex items-center gap-4 text-xs font-bold text-text-dark/40 uppercase tracking-widest">
                <span>Next Ritual:</span>
                <span className="text-gold font-display font-medium text-xl tracking-normal">
                  {countdownHero}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 min-w-[280px] w-full lg:w-auto">
            {upcomingBooking ? (
              <>
                {upcomingBooking.session_format.toLowerCase() === 'virtual' ? (
                  <a
                    href={canJoin ? upcomingBooking.zoom_join_url : undefined}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "w-full py-6 px-12 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all duration-700 relative overflow-hidden group shadow-luxury border",
                      canJoin 
                        ? 'bg-text-dark text-white border-text-dark hover:bg-gold hover:text-black cursor-pointer' 
                        : 'bg-white/40 text-text-dark/25 border-text-dark/5 cursor-not-allowed'
                    )}
                  >
                    <Video className={cn("w-4 h-4 transition-transform duration-500 group-hover:scale-110", canJoin ? "text-gold" : "text-text-dark/20")} />
                    Enter Sanctuary
                    {canJoin && (
                      <span className="absolute inset-0 border border-gold/40 rounded-full animate-ping opacity-60 pointer-events-none" />
                    )}
                  </a>
                ) : (
                  <div className="w-full py-6 px-12 rounded-full bg-white/40 border border-text-dark/5 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 text-text-dark/40 select-none">
                    <Compass className="w-4 h-4 text-gold/60" />
                    Sanctuary In-Person
                  </div>
                )}
                
                <a
                  href={getGoogleCalendarUrl(upcomingBooking)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-5.5 px-12 bg-white/60 hover:bg-white text-text-dark/60 hover:text-text-dark border border-text-dark/5 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all duration-500 shadow-soft"
                >
                  <Calendar className="w-4 h-4 text-gold" />
                  Calendar Sync
                </a>
              </>
            ) : (
              <a
                href="/book"
                className="w-full py-6 px-12 bg-[#CBAE73] hover:bg-[#CBAE73]/95 text-black rounded-full text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all duration-700 hover:scale-[1.02] shadow-luxury"
              >
                Book Your Next Ritual
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 2. Content Grids with Extra Whitespace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Grid: Upcoming & Momentum (7 cols) */}
        <div className="lg:col-span-7 space-y-12">
          
          {/* Upcoming Session Details Card */}
          {upcomingBooking && (
            <div className="bg-white/30 border border-white/60 p-10 rounded-[3rem] shadow-luxury backdrop-blur-md space-y-8">
              <div className="flex justify-between items-center pb-6 border-b border-gold/10">
                <h3 className="font-display text-2xl text-text-dark font-light">Upcoming Appointed Ritual</h3>
                <span className="text-[10px] font-bold text-text-dark/30 uppercase tracking-[0.2em]">
                  Ref: {upcomingBooking.booking_reference}
                </span>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-gold/60">Ritual</p>
                    <p className="font-display text-3xl text-text-dark tracking-tight leading-snug font-light">
                      {upcomingBooking.selected_session}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
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

                <div className="bg-white/50 border border-text-dark/5 p-8 rounded-[2rem] flex flex-col justify-between space-y-6 shadow-soft">
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold/80">Ritual Timeline</p>
                    <p className="text-xs text-text-dark/50 leading-relaxed font-light italic">
                      "{countdown}"
                    </p>
                  </div>
                  {upcomingBooking.session_format.toLowerCase() === 'virtual' && upcomingBooking.zoom_join_url && (
                    <div className="space-y-1.5 pt-3 border-t border-text-dark/5 text-[9px] font-medium text-text-dark/40">
                      <p>Meeting ID: {upcomingBooking.zoom_meeting_id || 'N/A'}</p>
                      <p>Password: {upcomingBooking.meeting_password || 'N/A'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Membership Visual Card (Healing Momentum) */}
          <div className="bg-white/30 border border-white/60 p-10 rounded-[3rem] shadow-luxury backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[200px] h-[200px] bg-gold/5 blur-[60px] rounded-full pointer-events-none" />
            
            <div className="space-y-8 max-w-sm text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-gold" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/40">Healing Journey Progress</span>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-display text-2xl text-text-dark tracking-tight font-light">Sanctuary Momentum</h3>
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs text-text-dark/70 font-light">
                    <span>Completed Journey:</span>
                    <span className="font-semibold text-gold">{completedSessionsCount} / {totalCreditsPossible} Completed</span>
                  </div>
                  <div className="flex justify-between text-xs text-text-dark/70 font-light">
                    <span>Ritual Reserved:</span>
                    <span className="font-semibold text-gold">{reservedCount} {reservedCount === 1 ? 'Ritual' : 'Rituals'} Reserved</span>
                  </div>
                  <div className="flex justify-between text-xs text-text-dark/70 font-light">
                    <span>Remaining Balance:</span>
                    <span className="font-semibold text-gold">{remainingCount} Remaining</span>
                  </div>
                  {activePackagesDetails.map((pkg, pIdx) => (
                    <div key={pkg.id || pIdx} className="flex justify-between text-xs text-text-dark/70 font-light border-t border-text-dark/5 pt-2 mt-2">
                      <span>Package:</span>
                      <span className="font-semibold text-gold">{pkg.name} (${pkg.price}) — {pkg.remaining}/{pkg.total} remaining</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-text-dark/30 pt-3 border-t border-text-dark/5">
                <span>Total: {totalCreditsPossible}</span>
                <span>Active: {remainingCount}</span>
                <span>Progress: {progressPercent}%</span>
              </div>
            </div>

            <div className="flex-shrink-0 bg-white/40 p-6 rounded-[2.5rem] border border-white/60 shadow-soft">
              <ProgressRing value={remainingCount} max={totalCreditsPossible} />
            </div>
          </div>

        </div>

        {/* Right Grid: Ritual Journey Timeline V2 (5 cols) */}
        <div className="lg:col-span-5 bg-white/30 border border-white/60 p-10 rounded-[3rem] shadow-luxury backdrop-blur-md space-y-8">
          <div className="space-y-2 text-left">
            <h3 className="font-display text-2xl text-text-dark tracking-tight font-light">Ritual Chronology</h3>
            <p className="text-xs text-text-dark/40 font-light">Your progress through the LumaFlow transformation paths.</p>
          </div>

          <div className="space-y-6 custom-scrollbar max-h-[560px] overflow-y-auto pr-2">
            {timelineItems.length > 0 ? (
              timelineItems.map((item, idx) => (
                <div 
                  key={idx} 
                  className="bg-white/40 border border-white/60 p-6 rounded-[2rem] hover:shadow-luxury hover:scale-[1.01] transition-all duration-500 flex flex-col gap-4 text-left group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h4 className={cn(
                      "text-sm font-bold text-text-dark transition-colors duration-500", 
                      item.isUpcoming ? "text-text-dark font-bold" : "text-text-dark/60 font-semibold",
                      item.isCancelled && "line-through opacity-50"
                    )}>
                      {item.ritualName}
                    </h4>
                    <span className={getChipStyle(item)}>
                      {getChipLabel(item)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-gold/5 pt-4 text-[10px] text-text-dark/40 font-medium">
                    <span>{item.date}</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-gold/60" />
                      {item.time} ({item.format})
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

      </div>
    </div>
  );
}
