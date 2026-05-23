import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Sparkles, Calendar, Clock, Mail, ChevronRight, Copy, Check, MapPin, Video, Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { paymentService } from '../../services/paymentService';
import { useBookingStore } from '../../store/bookingStore';
import { getLocalTimeForEST } from '../../utils/bookingUtils';

const formatTo12Hour = (time24: string): string => {
  if (!time24) return '';
  try {
    const [hoursStr, minutesStr] = time24.split(':');
    const hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHours.toString().padStart(2, '0')}:${minutesStr} ${ampm}`;
  } catch (e) {
    return time24;
  }
};

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const { setBookingReference, resetBooking } = useBookingStore();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [bookingData, setBookingData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const hasConfirmed = useRef(false);

  const [copiedText, setCopiedText] = useState<'url' | 'password' | 'address' | null>(null);

  const copyToClipboard = (text: string, type: 'url' | 'password' | 'address') => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  useEffect(() => {
    const confirmBooking = async () => {
      console.log("SUCCESS PAGE PARAMS");
      console.log("searchParams", searchParams.toString());
      console.log("sessionId", sessionId);

      if (!sessionId || hasConfirmed.current) {
        if (!sessionId) {
          setStatus('error');
          setError('Missing session information. Please verify your Stripe payment session.');
        }
        return;
      }
      
      hasConfirmed.current = true;

      try {
        const response = await paymentService.confirmPayment(sessionId);
        console.log("payment confirmation response:", response);
        const booking = response.booking || response;
        console.log("extracted booking object:", booking);
        setBookingData(booking);
        setBookingReference(booking.bookingReference);
        setStatus('success');
        
        // Optional: clear some store state but keep reference for the UI
      } catch (err: any) {
        console.error('Confirmation error:', err);
        setStatus('error');
        setError(err.message || 'Failed to confirm your ritual.');
      }
    };

    confirmBooking();
  }, [sessionId, setBookingReference, searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="text-center space-y-8">
          <Loader2 className="w-16 h-16 text-gold animate-spin mx-auto" />
          <div className="space-y-4">
            <h2 className="font-display text-4xl text-text-dark italic">Preparing Your Sanctuary Experience</h2>
            <p className="text-text-dark/40 uppercase tracking-[0.4em] text-[10px] font-bold">Aligning your session, confirmation, and sacred details.</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/50 backdrop-blur-xl border border-red-200/50 p-12 rounded-[3rem] text-center space-y-8 shadow-luxury">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <span className="text-4xl">⚠️</span>
          </div>
          <div className="space-y-4">
            <h2 className="font-display text-3xl text-text-dark">Journey Interrupted</h2>
            <p className="text-sm text-text-dark/60 leading-relaxed font-light">{error}</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-5 bg-text-dark text-white rounded-full text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-gold transition-all duration-700"
          >
            Return to Sanctuary
          </button>
        </div>
      </div>
    );
  }

  const parsedDate = bookingData?.selectedDate ? parseISO(bookingData.selectedDate) : null;

  return (
    <div className="min-h-screen bg-cream relative overflow-hidden flex flex-col items-center justify-center py-20 px-6">
      {/* Immersive Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ opacity: [0.2, 0.3, 0.2], scale: [1.1, 1, 1.1] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-4xl w-full space-y-12 text-center"
      >
        <div className="space-y-8">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-gold/30 rounded-full blur-2xl" />
            <div className="relative w-full h-full bg-gold rounded-full flex items-center justify-center shadow-luxury border border-white/30">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="font-display text-5xl md:text-7xl text-text-dark tracking-tight leading-tight">
              Sanctuary <span className="italic text-gold">Secured</span>
            </h1>
            <div className="flex flex-col items-center gap-3">
              <span className="text-[10px] font-bold text-text-dark/30 uppercase tracking-[0.5em]">Booking Reference</span>
              <span className="font-display text-4xl text-gold tracking-[0.2em]">{bookingData?.bookingReference}</span>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white/60 backdrop-blur-3xl border border-white/50 rounded-[4rem] p-12 shadow-luxury grid grid-cols-1 md:grid-cols-2 gap-12 text-left relative overflow-hidden">
          <div className="space-y-8">
            <div className="space-y-2 pb-6 border-b border-gold/5">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold/60">Selected Package</p>
              <div className="flex justify-between items-start">
                <p className="font-display text-2xl text-text-dark tracking-tight">
                  {bookingData?.packageName || "Single Session"}
                </p>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/60">Amount Paid</p>
                  <p className="text-xl font-display text-gold">${bookingData?.packagePrice || 45}</p>
                </div>
              </div>
              <p className="text-[9px] text-text-dark/40 uppercase tracking-[0.2em] font-medium mt-1">
                {bookingData?.packageCredits || 1} {(bookingData?.packageCredits || 1) === 1 ? 'Session' : 'Sessions'} Included
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold/60">Selected Ritual</p>
              <p className="font-display text-3xl text-text-dark tracking-tight">{bookingData?.selectedSession}</p>
            </div>
            
            <div className="flex flex-col gap-5 pt-2">
              <div className="flex items-center gap-4 text-text-dark/70">
                <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-gold" />
                </div>
                <span className="text-sm font-medium tracking-wide uppercase text-[10px]">{bookingData?.sessionFormat} Session</span>
              </div>
              <div className="flex items-center gap-4 text-text-dark/70">
                <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-gold" />
                </div>
                <span className="text-sm font-light tracking-wide">{bookingData?.email}</span>
              </div>
            </div>
          </div>

          <div className="space-y-8 md:border-l border-gold/10 md:pl-12">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold/60">Appointment Moment</p>
              <p className="font-display text-3xl text-text-dark">
                {parsedDate && format(parsedDate, 'MMMM do, yyyy')}
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-4">
                  <Clock className="w-4 h-4 text-gold/60" />
                  <span className="text-sm font-bold text-gold uppercase tracking-[0.3em]">
                    {bookingData?.selectedTime && formatTo12Hour(bookingData.selectedTime)} EST
                  </span>
                </div>
                {bookingData?.selectedDate && bookingData?.selectedTime && (
                  <p className="text-[9px] text-text-dark/40 italic pl-8">
                    Local Time: {getLocalTimeForEST(bookingData.selectedDate, bookingData.selectedTime)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <Calendar className="w-4 h-4 text-gold/60" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-dark/40">Portal guide dispatched to inbox</span>
              </div>
            </div>
          </div>
        </div>

        {/* Format Specific Details (Zoom or Location) */}
        {bookingData && (
          <div className="bg-white/50 backdrop-blur-xl border border-gold/15 rounded-[3rem] p-10 shadow-luxury max-w-2xl mx-auto space-y-6 text-left">
            {bookingData.sessionFormat?.toLowerCase() === 'virtual' ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gold/10 pb-4">
                  <Video className="w-6 h-6 text-gold" />
                  <h3 className="font-display text-2xl text-text-dark">Virtual Sanctuary Credentials</h3>
                </div>
                
                <div className="space-y-4">
                  <p className="text-xs text-text-dark/60 leading-relaxed font-light">
                    Your live session will take place in our virtual healing space via Zoom. Use the button below to join when it is time for your ritual.
                  </p>

                  {bookingData.zoomJoinUrl ? (
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <a
                        href={bookingData.zoomJoinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-4 bg-gold text-white text-center rounded-full text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-text-dark transition-all duration-700 shadow-luxury flex items-center justify-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        Enter Virtual Sanctuary
                      </a>
                      <button
                        onClick={() => copyToClipboard(bookingData.zoomJoinUrl, 'url')}
                        className="px-6 py-4 border border-gold/30 hover:border-gold rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-text-dark flex items-center justify-center gap-2 transition-all duration-500"
                      >
                        {copiedText === 'url' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        {copiedText === 'url' ? 'Copied' : 'Copy Link'}
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-gold/5 rounded-2xl border border-gold/10 flex items-start gap-3">
                      <Info className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                      <p className="text-[11px] text-text-dark/70 font-light">
                        Zoom details are being provisioned and will be sent to your email (<span className="font-medium">{bookingData.email}</span>) shortly.
                      </p>
                    </div>
                  )}

                  {bookingData.zoomMeetingId && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-cream/40 p-5 rounded-2xl border border-gold/5 text-xs">
                      <div>
                        <span className="text-[9px] font-bold text-text-dark/40 uppercase tracking-widest block mb-1">Meeting ID</span>
                        <span className="font-mono text-text-dark font-medium">{bookingData.zoomMeetingId}</span>
                      </div>
                      {bookingData.meetingPassword && (
                        <div className="relative">
                          <span className="text-[9px] font-bold text-text-dark/40 uppercase tracking-widest block mb-1">Password</span>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-text-dark font-medium">{bookingData.meetingPassword}</span>
                            <button
                              onClick={() => copyToClipboard(bookingData.meetingPassword, 'password')}
                              className="text-gold hover:text-text-dark transition-colors p-1"
                              title="Copy Password"
                            >
                              {copiedText === 'password' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Checklist */}
                <div className="pt-4 border-t border-gold/5 space-y-3">
                  <p className="text-[9px] font-bold text-gold uppercase tracking-[0.3em]">Virtual Checklist</p>
                  <ul className="space-y-2">
                    {[
                      'Find a quiet, private space where you will not be disturbed',
                      'Use high-quality headphones for the optimal soundscape and voice clarity',
                      'Wear loose, comfortable clothing to allow unrestricted breath flow',
                      'Ensure a stable internet connection and place your camera to see your upper body'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs text-text-dark/70 font-light">
                        <span className="text-gold shrink-0 mt-1">✦</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gold/10 pb-4">
                  <MapPin className="w-6 h-6 text-gold" />
                  <h3 className="font-display text-2xl text-text-dark">Sanctuary Location</h3>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-text-dark/60 leading-relaxed font-light">
                    Your physical session will take place at our Soho sanctuary. Please arrive early to settle in.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <div className="flex-1 p-5 bg-cream/40 rounded-2xl border border-gold/5 flex flex-col justify-center">
                      <span className="text-[9px] font-bold text-text-dark/40 uppercase tracking-widest block mb-1">Address</span>
                      <span className="text-sm text-text-dark font-medium">LumaFlow Sanctuary • Soho, Manhattan, NY</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard('LumaFlow Sanctuary, Soho, Manhattan, NY', 'address')}
                      className="px-6 py-4 border border-gold/30 hover:border-gold rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-text-dark flex items-center justify-center gap-2 transition-all duration-500"
                    >
                      {copiedText === 'address' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      {copiedText === 'address' ? 'Address Copied' : 'Copy Address'}
                    </button>
                  </div>
                </div>

                {/* Checklist */}
                <div className="pt-4 border-t border-gold/5 space-y-3">
                  <p className="text-[9px] font-bold text-gold uppercase tracking-[0.3em]">Sanctuary Arrival Checklist</p>
                  <ul className="space-y-2">
                    {[
                      'Wear comfortable, loose-fitting clothing suitable for deep breathing and movement',
                      'Please arrive 10 minutes prior to your scheduled time to settle into the space',
                      'Refrain from heavy meals for 2 hours preceding your ritual',
                      'Press the LumaFlow buzzer at the entrance, and our sanctuary guide will receive you'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs text-text-dark/70 font-light">
                        <span className="text-gold shrink-0 mt-1">✦</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* SECTION: Prepare For Your Session */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-both">
          <div className="space-y-2">
            <h2 className="font-display text-3xl text-text-dark italic">Prepare For Your Session</h2>
            <p className="text-text-dark/40 uppercase tracking-[0.4em] text-[10px] font-bold">Reserve this sacred moment in your calendar.</p>
          </div>

          <div className="flex justify-center">
            <button 
              onClick={() => {
                if (!bookingData) return;
                const startTime = bookingData.selectedDate.replace(/-/g, '') + 'T' + bookingData.selectedTime.replace(/:/g, '') + '00';
                
                // End time calculation (approximate using duration)
                const startHour = parseInt(bookingData.selectedTime.split(':')[0]);
                const startMin = parseInt(bookingData.selectedTime.split(':')[1]);
                const totalMins = startHour * 60 + startMin + (bookingData.duration || 60);
                const endHour = Math.floor(totalMins / 60);
                const endMin = totalMins % 60;
                const endTime = bookingData.selectedDate.replace(/-/g, '') + 'T' + 
                              endHour.toString().padStart(2, '0') + 
                              endMin.toString().padStart(2, '0') + '00';

                const isVirtual = bookingData.sessionFormat?.toLowerCase() === 'virtual';
                const locationStr = isVirtual 
                  ? (bookingData.zoomJoinUrl || 'Zoom link details to be sent')
                  : 'LumaFlow Sanctuary, Soho, Manhattan, NY';

                const rawDetails = isVirtual ? `
Client: ${bookingData.fullName || 'Valued Guest'}
Ritual: ${bookingData.selectedSession}
Reference: ${bookingData.bookingReference}

Zoom Join Link: ${bookingData.zoomJoinUrl || 'Provisioning details will be sent shortly'}
Meeting ID: ${bookingData.zoomMeetingId || 'N/A'}
Password: ${bookingData.meetingPassword || 'N/A'}

Preparation Checklist:
- Find a quiet, private space
- Water/herbal tea nearby
- Comfortable, loose clothing
- High-quality headphones recommended
- Test your internet and camera setup
`.trim() : `
Client: ${bookingData.fullName || 'Valued Guest'}
Ritual: ${bookingData.selectedSession}
Reference: ${bookingData.bookingReference}

Location: LumaFlow Sanctuary • Soho, Manhattan, NY

Preparation Checklist:
- Wear loose-fitting clothing
- Arrive 10 minutes early to settle in
- Refrain from heavy meals 2h prior
- Press the LumaFlow buzzer at the entrance
`.trim();

                const calendarTitle = encodeURIComponent('LumaFlow Healing Session');
                const calendarDetails = encodeURIComponent(rawDetails);
                const calendarLocation = encodeURIComponent(locationStr);
                
                const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${calendarTitle}&dates=${startTime}/${endTime}&details=${calendarDetails}&location=${calendarLocation}&ctz=America/New_York`;
                
                window.open(googleCalendarUrl, '_blank');
              }}
              className="px-10 py-5 border border-gold bg-gold/5 text-gold rounded-full text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gold hover:text-white transition-all duration-700 flex items-center gap-3 shadow-luxury"
            >
              <Calendar className="w-4 h-4" />
              Add to Google Calendar
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-8 items-center">
          <button 
            onClick={() => { resetBooking(); navigate('/'); }}
            className="px-16 py-6 bg-text-dark text-white rounded-full text-[11px] font-bold uppercase tracking-[0.4em] shadow-luxury hover:bg-gold transition-all duration-700 group"
          >
            <span className="flex items-center gap-2">
              Return to Sanctuary
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          
          <p className="text-text-dark/30 font-display italic text-lg max-w-md mx-auto">
            “Your space is held. Prepare gently for your arrival.”
          </p>
        </div>
      </motion.div>
      
      {/* Grain Texture */}
      <div className="fixed inset-0 bg-grain opacity-[0.03] pointer-events-none mix-blend-overlay" />
    </div>
  );
};

export default BookingSuccess;
