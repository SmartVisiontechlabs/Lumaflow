import { useAuth } from '../../providers/AuthProvider';
import { 
  Sparkles, 
  ShieldCheck, 
  HelpCircle,
  Clock,
  Compass
} from 'lucide-react';

export default function Membership() {
  const { membership: credits, activePackages, bookings, loading } = useAuth();
  const error = null;

  // Find packages from activePackages or bookings
  const membershipPasses = activePackages.length > 0
    ? activePackages.map(pkgRecord => {
        const pkgName = bookings.find(b => b.package_id === pkgRecord.package_id)?.package_name || 
              (pkgRecord.package_id === 'e69dfd27-1da5-4584-b410-72b1ea76c48f' ? 'Starter Healing Journey' :
               pkgRecord.package_id === 'ecca0c9b-42c6-4fbe-aec5-a1651ab6a29b' ? '10-Class Package' :
               pkgRecord.package_id === '772407fa-1b48-4f0f-80d5-1b343ada98c1' ? 'Single Session' : 'Active Package');
        return {
          id: pkgRecord.id,
          name: pkgName,
          total: pkgRecord.total_credits,
          remaining: pkgRecord.remaining_credits,
          expiresAt: (pkgRecord as any).expires_at ? new Date((pkgRecord as any).expires_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : null
        };
      })
    : [{
        id: 'default',
        name: credits ? 'Class Package' : 'Sanctuary Member',
        total: credits ? credits.total_credits : 0,
        remaining: credits ? credits.remaining_credits : 0,
        expiresAt: null
      }];

  const reserved = bookings.filter((b: any) => b.booking_status === 'confirmed').length;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* 1. Membership Pass Cards */}
        <div className="flex flex-col gap-6 w-full md:max-w-md">
          {membershipPasses.map((pass) => (
            <div key={pass.id} className="w-full bg-text-dark text-white p-10 rounded-[2.5rem] shadow-luxury relative overflow-hidden group">
              {/* Glowing accents */}
              <div className="absolute top-[-30%] right-[-10%] w-[250px] h-[250px] bg-gold/15 blur-[60px] rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[150px] h-[150px] bg-white/5 blur-[50px] rounded-full pointer-events-none" />
              
              <div className="space-y-12 relative z-10">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold-light">Membership Pass</p>
                    <h3 className="font-display text-2xl tracking-tight text-white">{pass.name}</h3>
                  </div>
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
                    <Compass className="w-5 h-5 text-gold animate-breathe" />
                  </div>
                </div>

                {/* Momentum Numbers */}
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-4xl font-display text-white tracking-tight">
                      {pass.remaining}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gold-light">Healing Momentum Remaining</p>
                  </div>

                  <div className="text-right text-[10px] font-semibold text-white/40 uppercase tracking-widest">
                    <div>Remaining: {pass.remaining} / {pass.total}</div>
                    {pass.expiresAt && <div className="text-gold/60 text-[8px] mt-1">Valid Until: {pass.expiresAt}</div>}
                  </div>
                </div>

                {/* Momentum Bar */}
                {pass.total > 0 && (
                  <div className="space-y-3">
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gold h-full rounded-full transition-all duration-1000"
                        style={{ width: `${(pass.remaining / pass.total) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] font-bold text-white/30 uppercase tracking-wider">
                      <span>{pass.remaining} of {pass.total} Sessions Remaining</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 2. Packages Information Guide */}
        <div className="flex-1 bg-white/40 border border-white/60 p-8 rounded-[2.5rem] shadow-soft space-y-6">
          <h3 className="font-display text-2xl text-text-dark tracking-tight">Healing Momentum Policy</h3>
          
          <div className="space-y-4 text-xs text-text-dark/70 leading-relaxed font-medium">
            <div className="flex gap-3">
              <ShieldCheck className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <p>
                Each momentum unit is valid for booking any single ritual journey. Booking a session automatically locks in the reservation.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <p>
                Deductions happen upon completing a ritual session. If you cancel at least 24 hours prior to the start time, your healing momentum balance is returned to you.
              </p>
            </div>

            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <p>
                Need to expand your sanctuary balance? Explore our package options or start a starter ritual sequence to continue expanding.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-text-dark/5">
            <a
              href="/pricing"
              className="inline-flex py-4 px-8 bg-text-dark hover:bg-gold text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-500 shadow-button"
            >
              Expand Sanctuary
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
