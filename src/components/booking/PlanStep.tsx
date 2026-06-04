import React, { useEffect, useState, memo } from 'react';
import { motion } from 'framer-motion';
import { useBookingFlow } from '../../hooks/useBookingFlow';
import { packageService, Package } from '../../services/packageService';
import { cn } from '../../lib/utils';
import StepHeading from './shared/StepHeading';
import { useAuth } from '../../providers/AuthProvider';
import { X as CloseIcon, AlertTriangle } from 'lucide-react';

const PlanStep = () => {
  const { selectedPackage, setSelectedPackage, nextStep, prevStep, journeyType, emotionalState, updateRecommendation } = useBookingFlow();
  const { isAuthenticated, activePackages } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicatePkgName, setDuplicatePkgName] = useState('');

  useEffect(() => {
    const fetchPackages = async () => {
      const startTime = Date.now();
      try {
        const pkgs = await packageService.getPackages();
        if (pkgs && pkgs.length > 0) {
          // Sort pkgs: we want Single Session first, Starter next, 10-Class last
          const sorted = [...pkgs].sort((a, b) => {
            const order = ['single-session', 'intro-offer', '10-class-package'];
            return order.indexOf(a.slug) - order.indexOf(b.slug);
          });
          setPackages(sorted);
        } else {
          // Fallback static packages
          setPackages([
            { id: '772407fa-1b48-4f0f-80d5-1b343ada98c1', name: 'Single Session', slug: 'single-session', description: 'A gentle introduction to your inner space.', price: 45, total_credits: 1, is_featured: false, is_active: true },
            { id: 'e69dfd27-1da5-4584-b410-72b1ea76c48f', name: 'Starter Healing Journey', slug: 'intro-offer', description: 'The perfect start to your healing journey.', price: 99, total_credits: 3, is_featured: true, is_active: true },
            { id: 'ecca0c9b-42c6-4fbe-aec5-a1651ab6a29b', name: '10-Class Package', slug: '10-class-package', description: 'Deepen your practice and anchor into peace.', price: 350, total_credits: 10, is_featured: false, is_active: true }
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        const elapsed = Date.now() - startTime;
        const minPause = 450; // 450ms sacred pause
        const remaining = Math.max(0, minPause - elapsed);
        setTimeout(() => {
          setLoading(false);
        }, remaining);
      }
    };

    fetchPackages();
  }, []);

  const handleSelect = (pkg: Package) => {
    if (isAuthenticated) {
      const isDuplicate = activePackages.some(
        (ap) => ap.package_id === pkg.id && ap.remaining_credits > 0
      );
      if (isDuplicate) {
        setDuplicatePkgName(pkg.name);
        setShowDuplicateModal(true);
        return;
      }
    }

    const pkgInfo = {
      id: pkg.id,
      name: pkg.name,
      credits: pkg.total_credits,
      price: pkg.price
    };
    setSelectedPackage(pkgInfo);
    
    // Since recommendation depends on Selected Package credits (for extra follow-up rituals),
    // we re-evaluate the recommendation here!
    updateRecommendation(journeyType, emotionalState, pkgInfo);
    
    nextStep();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <StepHeading 
          tag="Investment"
          title="Preparing your pathway..."
          subtitle="Aligning investment tiers with your selected ritual."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-10 rounded-[3rem] border border-text-dark/5 bg-white/30 backdrop-blur-md min-h-[280px] flex flex-col justify-between relative overflow-hidden animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              <div className="space-y-4">
                <div className="h-6 w-2/3 bg-text-dark/10 rounded-full" />
                <div className="h-4 w-5/6 bg-text-dark/5 rounded-full" />
                <div className="h-4 w-4/5 bg-text-dark/5 rounded-full" />
              </div>
              <div className="pt-6 border-t border-text-dark/5 flex justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-8 bg-text-dark/5 rounded-full" />
                  <div className="h-6 w-12 bg-text-dark/10 rounded-full" />
                </div>
                <div className="space-y-2 text-right">
                  <div className="h-3 w-8 bg-text-dark/5 rounded-full" />
                  <div className="h-4 w-16 bg-text-dark/10 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto">
      <StepHeading 
        tag="Investment"
        title="How deeply would you like support?"
        subtitle="Select a plan to hold space for your healing journey."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg, index) => (
          <motion.button
            key={pkg.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{
              y: -5,
              scale: 1.015,
              boxShadow: "0 20px 40px -15px rgba(203, 174, 115, 0.15)",
            }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleSelect(pkg)}
            className={cn(
              "group relative p-10 rounded-[3rem] border transition-all duration-500 text-left overflow-hidden flex flex-col justify-between min-h-[280px]",
              selectedPackage?.id === pkg.id
                ? "bg-gold border-gold text-white shadow-[0_15px_40px_rgba(203,174,115,0.35)] scale-[1.03]"
                : "bg-white/40 backdrop-blur-md border-text-dark/5 text-text-dark/60 hover:border-gold/30 hover:bg-white hover:text-text-dark shadow-sm"
            )}
          >
            {/* Ambient Shine */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2000ms]" />

            <div className="space-y-4 w-full">
              <div className="flex justify-between items-start">
                <h3 className={cn(
                  "font-display text-xl tracking-tight transition-colors duration-500",
                  selectedPackage?.id === pkg.id ? "text-white" : "text-text-dark"
                )}>
                  {pkg.name}
                </h3>
                {pkg.is_featured && (
                  <span className={cn(
                    "text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border",
                    selectedPackage?.id === pkg.id ? "border-white/30 bg-white/20 text-white" : "border-gold/20 bg-gold/10 text-gold"
                  )}>
                    Recommended
                  </span>
                )}
              </div>
              
              <p className={cn(
                "text-xs font-light leading-relaxed transition-colors duration-500",
                selectedPackage?.id === pkg.id ? "text-white/80" : "text-text-dark/50"
              )}>
                {pkg.description}
              </p>
            </div>

            <div className="pt-6 w-full flex justify-between items-end border-t border-gold/10">
              <div>
                <p className={cn("text-[9px] font-bold uppercase tracking-[0.2em] mb-1", selectedPackage?.id === pkg.id ? "text-white/60" : "text-text-dark/40")}>Price</p>
                <p className={cn("font-display text-2xl font-bold transition-colors duration-500", selectedPackage?.id === pkg.id ? "text-white" : "text-gold")}>
                  ${pkg.price}
                </p>
              </div>
              <div className="text-right">
                <p className={cn("text-[9px] font-bold uppercase tracking-[0.2em] mb-1", selectedPackage?.id === pkg.id ? "text-white/60" : "text-text-dark/40")}>Credits</p>
                <p className={cn("text-base font-semibold transition-colors duration-500", selectedPackage?.id === pkg.id ? "text-white" : "text-text-dark")}>
                  {pkg.total_credits} session{pkg.total_credits > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
      
      <div className="flex justify-center mt-12">
        <button 
          onClick={prevStep}
          className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.4em] text-gold/30 hover:text-gold transition-all duration-700 focus:outline-none group cursor-pointer"
        >
          &larr; Prev Step
        </button>
      </div>

      {/* Journey Already Active Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-[#0A0A0A]/60 backdrop-blur-md"
            onClick={() => setShowDuplicateModal(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-white/95 backdrop-blur-2xl border border-gold/10 p-10 md:p-12 rounded-[2.5rem] shadow-[0_30px_70px_rgba(203,174,115,0.15)] max-w-md w-full text-center space-y-8 z-10 text-text-dark"
          >
            <button 
              onClick={() => setShowDuplicateModal(false)}
              className="absolute top-6 right-6 text-text-dark/40 hover:text-gold transition-colors p-1"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
            <div className="space-y-6">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6 text-gold" />
              </div>
              <div className="space-y-3">
                <h4 className="font-display text-3xl text-text-dark tracking-tight">
                  Journey Already Active
                </h4>
                <p className="text-xs text-text-dark/60 font-light leading-relaxed">
                  Your <strong className="font-semibold text-gold">{duplicatePkgName}</strong> is currently active. <br />
                  You still have sanctuary moments remaining.
                </p>
                <p className="text-xs text-text-dark/50 italic font-light pt-2">
                  Complete your current pathway or explore a deeper experience.
                </p>
              </div>
              <div className="flex flex-col gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowDuplicateModal(false);
                    // Bypasses plan purchase, set package to null to use existing credits, proceed to next step
                    setSelectedPackage(null);
                    updateRecommendation(journeyType, emotionalState, null);
                    nextStep();
                  }}
                  className="w-full py-4 bg-text-dark hover:bg-gold text-white hover:text-black rounded-full text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-500 shadow-md cursor-pointer"
                >
                  Continue Current Journey
                </button>
                <button
                  onClick={() => setShowDuplicateModal(false)}
                  className="w-full py-4 bg-white/40 border border-text-dark/10 hover:border-gold/40 text-text-dark/60 hover:text-gold rounded-full text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-500 cursor-pointer"
                >
                  Explore Other Plans
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default memo(PlanStep);
