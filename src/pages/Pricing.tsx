import { useEffect, useState } from 'react';
import { useBookingStore } from '../store/bookingStore';
import SEOMetadata from '../components/seo/SEOMetadata';
import { packageService, Package } from '../services/packageService';

export default function Pricing() {
  const openBooking = useBookingStore(state => state.openBooking);
  const [dbPackages, setDbPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPackages() {
      try {
        const pkgs = await packageService.getPackages();
        setDbPackages(pkgs);
      } catch (err) {
        console.error('Failed to load packages:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPackages();
  }, []);

  const staticTiers = [
    { 
      title: "Drop-in", 
      price: "$45", 
      desc: "Single session access", 
      pkg: { id: '772407fa-1b48-4f0f-80d5-1b343ada98c1', name: 'Single Session', credits: 1, price: 45 } 
    },
    { 
      title: "Starter Journey", 
      price: "$99", 
      desc: "Starter Healing Journey (3 sessions)", 
      highlighted: true, 
      pkg: { id: 'e69dfd27-1da5-4584-b410-72b1ea76c48f', name: 'Starter Healing Journey', credits: 3, price: 99 } 
    },
    { 
      title: "10-Class Pass", 
      price: "$350", 
      desc: "Valid for 6 months (10 sessions)", 
      pkg: { id: 'ecca0c9b-42c6-4fbe-aec5-a1651ab6a29b', name: '10-Class Package', credits: 10, price: 350 } 
    }
  ];

  const tiers = dbPackages.length > 0
    ? dbPackages.map(pkg => ({
        title: pkg.name,
        price: `$${pkg.price}`,
        desc: pkg.description,
        highlighted: pkg.is_featured,
        pkg: {
          id: pkg.id,
          name: pkg.name,
          credits: pkg.total_credits,
          price: pkg.price
        }
      }))
    : staticTiers;

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen relative">
      <SEOMetadata 
        title="LumaFlow Pricing | Rituals & Session Packages" 
        description="Explore premium single breathwork sessions and multi-journey credit packages designed to restore nervous system balance."
      />
      <div className="absolute top-0 right-0 w-1/2 h-96 opacity-10 -z-10 pointer-events-none">
        <img src="/pricing-image.png" alt="" className="w-full h-full object-cover mix-blend-luminosity rounded-bl-full" />
      </div>
      
      <div className="text-center mb-20 animate-fade-in">
        <h1 className="font-display text-5xl md:text-7xl text-text-dark mb-6">Investment</h1>
        <p className="text-lg text-text-dark/70 max-w-2xl mx-auto">Commit to your wellness journey with our flexible options.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto animate-fade-in delay-200">
        {isLoading && dbPackages.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center gap-4 py-20">
            <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gold/60">Loading Sacred Tiers</span>
          </div>
        ) : (
          tiers.map((tier, idx) => (
            <div key={idx} className={`p-10 rounded-3xl transition-transform hover:-translate-y-2 ${tier.highlighted ? 'bg-[#CBAE73] text-black shadow-2xl scale-105' : 'glass border border-[#CBAE73]/20'}`}>
              <h3 className={`font-display text-2xl mb-2 ${tier.highlighted ? 'text-black' : 'text-text-dark'}`}>{tier.title}</h3>
              <div className="text-4xl font-light mb-6">{tier.price}</div>
              <p className={`mb-8 ${tier.highlighted ? 'text-black/80' : 'text-text-dark/60'}`}>{tier.desc}</p>
              <button 
                onClick={() => openBooking(tier.pkg, { entrySource: 'pricing' })}
                className={`w-full py-3 rounded-full font-semibold tracking-wider uppercase text-sm transition-colors cursor-pointer ${tier.highlighted ? 'bg-black text-[#CBAE73] hover:bg-zinc-900' : 'bg-text-dark text-white hover:bg-gold'}`}
              >
                Select Plan
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

