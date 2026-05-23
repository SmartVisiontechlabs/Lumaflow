import { useClientPortal } from '../../hooks/useClientPortal';
import { 
  Sparkles, 
  ShieldCheck, 
  HelpCircle,
  Clock,
  Compass
} from 'lucide-react';

export default function Membership() {
  const { credits, loading, error, bookings } = useClientPortal();

  // Find packages from bookings
  const packageBookings = bookings.filter(b => b.package_id && b.package_credits > 1);
  const activePackageName = credits ? (packageBookings[0]?.package_name || 'Class Package') : 'None';

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
        <p className="text-sm text-red-400 font-bold uppercase tracking-wider">Error Loading Membership Details</p>
        <p className="text-xs text-text-dark/40 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* 1. Membership Pass Card */}
        <div className="w-full md:max-w-md bg-text-dark text-white p-10 rounded-[2.5rem] shadow-luxury relative overflow-hidden group">
          {/* Glowing accents */}
          <div className="absolute top-[-30%] right-[-10%] w-[250px] h-[250px] bg-gold/15 blur-[60px] rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[150px] h-[150px] bg-white/5 blur-[50px] rounded-full pointer-events-none" />
          
          <div className="space-y-12 relative z-10">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold-light">Membership Pass</p>
                <h3 className="font-display text-2xl tracking-tight text-white">{credits ? activePackageName : 'Sanctuary Member'}</h3>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
                <Compass className="w-5 h-5 text-gold animate-breathe" />
              </div>
            </div>

            {/* Credit Numbers */}
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-4xl font-display text-white tracking-tight">
                  {credits ? credits.remaining_credits : 0}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gold-light">Available Credits</p>
              </div>

              <div className="text-right text-[10px] font-semibold text-white/40 uppercase tracking-widest">
                <div>Total: {credits ? credits.total_credits : 0}</div>
                <div>Used: {credits ? credits.used_credits : 0}</div>
              </div>
            </div>

            {/* Credit Bar */}
            {credits && (
              <div className="space-y-3">
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gold h-full rounded-full transition-all duration-1000"
                    style={{ width: `${(credits.remaining_credits / credits.total_credits) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[8px] font-bold text-white/30 uppercase tracking-wider">
                  <span>Empty</span>
                  <span>{Math.round((credits.remaining_credits / credits.total_credits) * 100)}% Full</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Packages Information Guide */}
        <div className="flex-1 bg-white/40 border border-white/60 p-8 rounded-[2.5rem] shadow-soft space-y-6">
          <h3 className="font-display text-2xl text-text-dark tracking-tight">Ritual Credits Policy</h3>
          
          <div className="space-y-4 text-xs text-text-dark/70 leading-relaxed font-medium">
            <div className="flex gap-3">
              <ShieldCheck className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <p>
                Each class credit is valid for booking any single ritual journey. Booking a session automatically locks in the reservation.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <p>
                Deductions happen upon completing a ritual session. If you cancel at least 24 hours prior to the start time, your credit balance is returned to you.
              </p>
            </div>

            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <p>
                Need to top up your balance? Explore our package options or start a starter ritual sequence to continue expanding.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-text-dark/5">
            <a
              href="/pricing"
              className="inline-flex py-4 px-8 bg-text-dark hover:bg-gold text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-500 shadow-button"
            >
              Purchase Credits
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
