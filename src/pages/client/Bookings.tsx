import { useAuth } from '../../providers/AuthProvider';
import { 
  Calendar, 
  Clock, 
  Video, 
  Award,
  Lock,
  ExternalLink,
  Compass
} from 'lucide-react';
import { fromZonedTime } from 'date-fns-tz';

function getGoogleCalendarUrl(booking: any) {
  try {
    const tz = booking.timezone || 'America/New_York';
    const startUTC = fromZonedTime(`${booking.selected_date}T${booking.selected_time}:00`, tz);
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

export default function Bookings() {
  const { bookings, loading } = useAuth();
  const error = null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/5 border border-red-500/10 p-8 rounded-3xl text-center">
        <p className="text-sm text-red-400 font-bold uppercase tracking-wider">Error Loading Bookings</p>
        <p className="text-xs text-text-dark/40 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-dark/40">List of All Sessions</p>
      </div>

      {bookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => {
            const isVirtual = booking.session_format.toLowerCase() === 'virtual';
            const isUpcoming = booking.booking_status === 'confirmed';
            
            return (
              <div 
                key={booking.id}
                className="bg-white/40 border border-white/60 p-8 rounded-[2rem] shadow-soft hover:shadow-luxury transition-all duration-700 flex flex-col justify-between"
              >
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <span className={`px-3.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] ${
                      booking.booking_status === 'completed'
                        ? 'bg-green-500/10 text-green-600'
                        : booking.booking_status === 'confirmed'
                        ? 'bg-blue-500/10 text-blue-600'
                        : 'bg-text-dark/5 text-text-dark/40'
                    }`}>
                      {booking.booking_status}
                    </span>
                    <span className="text-[10px] font-medium text-text-dark/30 uppercase tracking-widest">
                      {booking.booking_reference}
                    </span>
                  </div>

                  {/* Title & Time */}
                  <div className="space-y-2">
                    <h3 className="font-display text-xl text-text-dark leading-snug">
                      {booking.selected_session}
                    </h3>
                    <div className="space-y-1 text-xs text-text-dark/60 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gold" />
                        <span>{booking.selected_date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gold" />
                        <span>{booking.selected_time} ({booking.timezone})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-gold" />
                        <span>{booking.duration} mins • {booking.session_format}</span>
                      </div>
                    </div>
                  </div>

                  {/* Zoom Details for Virtual session */}
                  {isVirtual && booking.zoom_join_url && (
                    <div className="p-4 bg-white/60 rounded-2xl border border-text-dark/5 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-text-dark/70">
                        <Video className="w-4 h-4 text-gold" />
                        <span>Zoom Credentials</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-text-dark/50 font-semibold uppercase tracking-wider">
                        <div>Meeting ID:</div>
                        <div className="text-text-dark/80 font-mono select-all">{booking.zoom_meeting_id}</div>
                        <div>Passcode:</div>
                        <div className="text-text-dark/80 font-mono select-all">{booking.meeting_password || 'None'}</div>
                      </div>

                      {isUpcoming && (
                        <a
                          href={booking.zoom_join_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 flex items-center justify-center gap-1.5 w-full py-3 bg-text-dark hover:bg-gold text-white rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-500"
                        >
                          Launch Zoom Meeting
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {isUpcoming && (
                  <div className="mt-8 pt-6 border-t border-text-dark/5 flex items-center justify-between">
                    <a
                      href={getGoogleCalendarUrl(booking)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold hover:text-text-dark flex items-center gap-1.5 transition-colors duration-500"
                    >
                      Calendar Link
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white/20 border border-white/40 p-16 rounded-[2.5rem] text-center shadow-soft">
          <div className="w-12 h-12 bg-white/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-text-dark/5">
            <Compass className="w-5 h-5 text-gold/60" />
          </div>
          <h3 className="text-xl font-display text-text-dark">No bookings found</h3>
          <p className="text-xs text-text-dark/40 max-w-xs mx-auto mt-2 mb-6">
            You do not have any scheduled ritual sessions in our sanctuary records.
          </p>
          <a
            href="/book"
            className="inline-flex py-4 px-8 bg-text-dark text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gold shadow-button transition-all duration-700"
          >
            Book a Session
          </a>
        </div>
      )}
    </div>
  );
}
