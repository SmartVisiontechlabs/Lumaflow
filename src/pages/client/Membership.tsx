import { useEffect, useState } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { 
  Sparkles, 
  ShieldCheck, 
  Clock,
  Compass,
  ArrowRight,
  Loader2,
  CalendarDays,
  Gem
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { paymentService } from '../../services/paymentService';
import { cn } from '../../lib/utils';

export default function Membership() {
  const { membership: credits, activePackages, bookings, loading: authLoading } = useAuth();
  const [packages, setPackages] = useState<any[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [purchaseLoadingId, setPurchaseLoadingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadPackages() {
      try {
        if (!supabase) return;
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true });
        
        if (error) {
          console.error('Error fetching packages:', error.message);
        } else if (data) {
          setPackages(data);
        }
      } catch (err) {
        console.error('Failed to load packages:', err);
      } finally {
        setPackagesLoading(false);
      }
    }
    loadPackages();
  }, []);

  const handlePurchase = async (pkgId: string) => {
    setPurchaseLoadingId(pkgId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        window.location.href = '/login';
        return;
      }
      
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .maybeSingle();
      
      const fullName = profile?.full_name || session.user.email?.split('@')[0] || 'Valued Guest';
      const email = session.user.email!;
      
      console.log(`[Membership] Initiating Stripe package checkout for package: ${pkgId}`);
      const checkoutUrl = await paymentService.createPackageCheckoutSession({
        packageId: pkgId,
        email,
        fullName,
        userId: session.user.id
      });
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('sanctuary payment redirection failed.');
      }
    } catch (err: any) {
      console.error('[Membership] Purchase error:', err);
      alert(`Sanctuary transaction failed: ${err.message || err}`);
    } finally {
      setPurchaseLoadingId(null);
    }
  };

  const getPackageName = (packageId: string | null) => {
    if (!packageId) return 'Somatic Credits';
    const pkg = packages.find(p => p.id === packageId);
    return pkg ? pkg.name : 'Wellness Pass';
  };

  const formatLocaleDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Find active packages or default
  const membershipPasses = activePackages.length > 0
    ? activePackages.map(pkgRecord => ({
        id: pkgRecord.id,
        name: getPackageName(pkgRecord.package_id),
        total: pkgRecord.total_credits,
        used: pkgRecord.used_credits || 0,
        remaining: pkgRecord.remaining_credits,
        purchaseDate: formatLocaleDate(pkgRecord.purchase_date || pkgRecord.created_at),
        expiresAt: formatLocaleDate(pkgRecord.expires_at)
      }))
    : [{
        id: 'default',
        name: credits ? 'Class Package' : 'Sanctuary Member',
        total: credits ? credits.total_credits : 0,
        used: credits ? credits.used_credits : 0,
        remaining: credits ? credits.remaining_credits : 0,
        purchaseDate: 'N/A',
        expiresAt: 'N/A'
      }];

  const isLoading = authLoading || (packagesLoading && packages.length === 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-gold animate-spin" />
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gold/60">Aligning Sanctuary Passports</span>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col lg:flex-row gap-12 items-start text-left">
        
        {/* 1. Membership Passes */}
        <div className="flex flex-col gap-8 w-full lg:max-w-lg">
          <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-text-dark/40 px-2">Active Sacred Passes</h4>
          
          {membershipPasses.map((pass) => (
            <div 
              key={pass.id} 
              className="w-full bg-[#1C1C1C] border border-white/5 text-white p-8 md:p-10 rounded-[3rem] shadow-luxury relative overflow-hidden group transition-all duration-700 hover:shadow-[0_30px_60px_-15px_rgba(203,174,115,0.15)]"
            >
              {/* Luminous blur background */}
              <div className="absolute top-[-30%] right-[-10%] w-[300px] h-[300px] bg-gold/15 blur-[80px] rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[180px] h-[180px] bg-white/5 blur-[60px] rounded-full pointer-events-none" />
              
              <div className="space-y-10 relative z-10">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Gem className="w-3.5 h-3.5 text-gold animate-pulse" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold/80">LumaFlow Passport</span>
                    </div>
                    <h3 className="font-display text-2xl md:text-3xl tracking-tight text-white">{pass.name}</h3>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/10 shadow-luxury">
                    <Compass className="w-5 h-5 text-gold animate-breathe" />
                  </div>
                </div>

                {/* Credit Momentum */}
                <div className="grid grid-cols-3 gap-4 border-y border-white/5 py-6">
                  <div className="text-center md:text-left">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-white/30 block mb-1">Total</span>
                    <span className="text-2xl font-display text-white">{pass.total}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-white/30 block mb-1">Used</span>
                    <span className="text-2xl font-display text-gold/60">{pass.used}</span>
                  </div>
                  <div className="text-center md:text-right">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-gold block mb-1">Remaining</span>
                    <span className="text-2xl font-display text-gold animate-pulse">{pass.remaining}</span>
                  </div>
                </div>

                {/* Progress bar */}
                {pass.total > 0 && (
                  <div className="space-y-2">
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gold h-full rounded-full transition-all duration-[1500ms]"
                        style={{ width: `${(pass.remaining / pass.total) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] font-bold text-white/30 uppercase tracking-wider">
                      <span>{pass.remaining} of {pass.total} credits active</span>
                      <span>{Math.round((pass.remaining / pass.total) * 100)}% Available</span>
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="flex justify-between items-center text-[9px] font-medium text-white/40 uppercase tracking-widest pt-2">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-white/20" />
                    <span>Purchased: {pass.purchaseDate}</span>
                  </div>
                  <div className="text-right text-gold/60">
                    <span>Expires: {pass.expiresAt}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 2. Policies info guide */}
        <div className="flex-1 bg-white/40 border border-white/60 p-8 md:p-10 rounded-[3rem] shadow-soft space-y-8 h-full">
          <div>
            <h3 className="font-display text-2xl text-text-dark tracking-tight">Healing Momentum Policy</h3>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-text-dark/30 mt-1">Nervous system commitment guidelines</p>
          </div>
          
          <div className="space-y-6 text-xs text-text-dark/70 leading-relaxed font-medium">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-gold" />
              </div>
              <div>
                <h5 className="font-bold text-text-dark uppercase tracking-wider text-[10px] mb-1">Deduction Protocol</h5>
                <p>Each momentum unit is valid for booking any single ritual journey. Credits are verified and reserved instantly upon appointment scheduling.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-gold" />
              </div>
              <div>
                <h5 className="font-bold text-text-dark uppercase tracking-wider text-[10px] mb-1">24-Hour Return Guarantee</h5>
                <p>If you cancel or reschedule your session at least 24 hours prior to the ritual start time, your credit balance is automatically returned to your pass.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-gold" />
              </div>
              <div>
                <h5 className="font-bold text-text-dark uppercase tracking-wider text-[10px] mb-1">Continuous Integration</h5>
                <p>Nervous system expansion occurs through consistent container space. Committing to multi-session passes anchors and integrates somatic releases.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Purchase Direct Packages */}
      <div className="space-y-8 border-t border-text-dark/5 pt-12 text-left">
        <div>
          <h3 className="font-display text-3xl text-text-dark tracking-tight">Expand Your Sanctuary Balance</h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-dark/20 mt-1">Purchase multi-session packages directly to gain credits instantly</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.filter(pkg => pkg.slug !== 'single-session' && pkg.slug !== 'test-package').map((pkg) => {
            const isFeatured = pkg.is_featured || pkg.slug === 'transformation-journey';
            const credits = pkg.credits || pkg.total_credits || 1;
            const validDays = pkg.valid_days || (pkg.validity_months * 30) || 30;

            return (
              <div 
                key={pkg.id} 
                className={cn(
                  "p-8 rounded-[2.5rem] flex flex-col justify-between transition-all duration-700 hover:-translate-y-1 relative overflow-hidden group",
                  isFeatured 
                    ? "bg-[#CBAE73] text-black shadow-2xl scale-105 border border-[#CBAE73]/50" 
                    : "bg-white/50 border border-gold/10 text-text-dark backdrop-blur-md shadow-soft"
                )}
              >
                {/* Glowing featured highlight */}
                {isFeatured && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 blur-2xl rounded-full -mr-8 -mt-8 pointer-events-none" />
                )}

                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-[0.3em] px-3 py-1 rounded-full",
                        isFeatured ? "bg-black/10 text-black font-semibold" : "bg-gold/10 text-gold"
                      )}>
                        {credits} Sessions
                      </span>
                    </div>
                    <div className="text-3xl font-light font-display">
                      ${pkg.price}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-display text-2xl font-medium tracking-tight flex items-center gap-2">
                      {pkg.name}
                      {isFeatured && (
                        <span className="text-[8px] bg-black text-white px-2 py-0.5 rounded-full uppercase tracking-widest font-bold font-sans">
                          Featured
                        </span>
                      )}
                    </h5>
                    <p className={cn(
                      "text-xs leading-relaxed font-light",
                      isFeatured ? "text-black/70 font-normal" : "text-text-dark/60"
                    )}>
                      {pkg.description}
                    </p>
                  </div>
                  
                  <div className={cn(
                    "text-[9px] font-bold uppercase tracking-wider pt-2 border-t",
                    isFeatured ? "border-black/10 text-black/40" : "border-text-dark/5 text-text-dark/40"
                  )}>
                    Validity: {validDays} Days ({pkg.validity_months || Math.ceil(validDays/30)} Month{pkg.validity_months > 1 ? 's' : ''})
                  </div>
                </div>

                <div className="mt-8 pt-2">
                  <button
                    disabled={purchaseLoadingId === pkg.id}
                    onClick={() => handlePurchase(pkg.id)}
                    className={cn(
                      "w-full py-4 rounded-full font-bold tracking-[0.2em] uppercase text-[10px] transition-all duration-700 flex items-center justify-center gap-2 shadow-button cursor-pointer",
                      isFeatured 
                        ? "bg-black text-white hover:bg-neutral-900" 
                        : "bg-text-dark text-white hover:bg-gold"
                    )}
                  >
                    {purchaseLoadingId === pkg.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Initializing Stripe...
                      </>
                    ) : (
                      <>
                        Purchase Package
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
