import React from 'react';
import { motion } from 'framer-motion';
import { Wind, Heart, Sparkles, Sun } from 'lucide-react';
import { useCmsStore } from '../../store/cmsStore';
import { TransformationStep } from '../../types/cms';

const iconMap: Record<string, React.ReactNode> = {
  wind: <Wind className="w-7 h-7 stroke-[1.1]" />,
  heart: <Heart className="w-7 h-7 stroke-[1.1]" />,
  sparkles: <Sparkles className="w-7 h-7 stroke-[1.1]" />,
  sun: <Sun className="w-7 h-7 stroke-[1.1]" />
};

export default function Healing() {
  const steps = useCmsStore(state => state.steps);
  const isLoading = useCmsStore(state => state.isLoading);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.4
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 2.0, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <>
      <div className="section-transition" />
      <section id="transformation-journey" className="py-40 bg-transparent relative section-fade-top section-fade-bottom overflow-hidden scroll-mt-24">
        
        {/* Soft Ambient glow for sacred atmosphere */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] radial-glow opacity-5 select-none pointer-events-none" />
        <div className="absolute top-[10%] left-[20%] w-[30vw] h-[30vw] ambient-glow-gold opacity-[0.04] select-none pointer-events-none" />

        <div className="max-w-7xl mx-auto px-8 relative z-10">
          
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 2.0, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-36"
          >
            <span className="text-[#CBAE73] text-[10px] font-bold tracking-[0.4em] uppercase mb-4 block animate-glow">The Journey</span>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-text-dark font-light">
              Path to <span className="italic text-[#CBAE73]">Transformation</span>
            </h2>
            <div className="w-12 h-[1px] bg-[#CBAE73]/30 mx-auto mt-6" />
          </motion.div>

          {/* Interactive Step Cards Timeline */}
          {isLoading || steps.length === 0 ? (
            <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-10 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center relative bg-white/10 border border-[#CBAE73]/5 p-8 pt-10 rounded-3xl h-full justify-start space-y-6"
                >
                  <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center border border-gold/5" />
                  <div className="space-y-4 w-full flex flex-col items-center">
                    <div className="h-2.5 w-24 bg-gold/15 rounded" />
                    <div className="h-6 w-36 bg-gold/10 rounded" />
                    <div className="space-y-2 w-full flex flex-col items-center">
                      <div className="h-3 w-11/12 bg-gold/5 rounded" />
                      <div className="h-3 w-10/12 bg-gold/5 rounded" />
                      <div className="h-3 w-8/12 bg-gold/5 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-10"
            >
              
              {/* Desktop Timeline Flow Connector Line */}
              <div className="absolute top-[48px] left-[12%] right-[12%] h-[1.5px] bg-gradient-to-r from-transparent via-[#CBAE73]/40 to-transparent hidden lg:block z-0 pointer-events-none" />

              {steps.map((step, index) => (
                <motion.div
                  key={step.id || step.step_number}
                  variants={itemVariants}
                  className="flex flex-col items-center text-center relative group bg-white/20 backdrop-blur-[2px] border border-[#CBAE73]/10 p-8 pt-10 rounded-3xl hover:bg-[#FAF8F5]/85 hover:border-[#CBAE73]/30 hover:shadow-[0_20px_50px_rgba(203,174,115,0.08)] hover:scale-[1.02] transition-all duration-[800ms] h-full justify-start"
                >
                  {/* Node Step Icon */}
                  <div className="relative mb-8 z-10">
                    {/* Outer breathing ring */}
                    <motion.div 
                      animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 7 + index * 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -inset-5 rounded-full bg-[#FAF8F5]/80 border border-[#CBAE73]/30 blur-sm -z-10 group-hover:border-[#CBAE73]/50 group-hover:scale-120 transition-all duration-700"
                    />
                    
                    {/* Central Node Circle */}
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-[#CBAE73] border border-gold/15 shadow-[0_8px_20px_rgba(203,174,115,0.06)] group-hover:shadow-[0_15px_30px_rgba(203,174,115,0.12)] group-hover:border-gold/40 group-hover:scale-105 transition-all duration-500">
                      {iconMap[(step.icon || (step as any).icon_name || '').toLowerCase()] || <Sparkles className="w-7 h-7 stroke-[1.1]" />}
                    </div>

                    {/* Index indicator */}
                    <span className="absolute -top-1 -right-2 text-[9px] font-bold text-[#CBAE73] bg-white px-2 py-0.5 rounded-full border border-gold/10 font-body scale-90 group-hover:scale-100 transition-all duration-500">
                      0{step.step_number}
                    </span>
                  </div>

                  {/* Typography / Copy */}
                  <div className="space-y-4 max-w-xs relative z-10 mt-2 flex-grow flex flex-col justify-start">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#CBAE73]/80 group-hover:text-gold transition-colors duration-500 block">
                      {step.subtitle}
                    </span>
                    
                    <h3 className="font-display text-2xl text-text-dark tracking-wide font-light">
                      {step.title}
                    </h3>
                    
                    <p className="text-text-dark/70 font-body font-light leading-relaxed text-sm group-hover:text-text-dark/90 transition-colors duration-500">
                      {step.description}
                    </p>
                  </div>

                  {/* Mobile visual downward connector arrow */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-1/2 bottom-[-45px] -translate-x-1/2 w-[1.5px] h-10 bg-gradient-to-b from-[#CBAE73]/40 to-transparent block lg:hidden z-0 pointer-events-none" />
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}
