import React from 'react';
import { motion } from 'framer-motion';
import { Wind, Heart, Sparkles, ShieldCheck, Compass, CheckCircle2, Star } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';
import { useNavigate } from 'react-router-dom';
import SEOMetadata from '../components/seo/SEOMetadata';

export default function Services() {
  const openBooking = useBookingStore(state => state.openBooking);
  const navigate = useNavigate();

  const handleBookClick = (serviceName: string) => {
    openBooking(null, { journeyType: serviceName, entrySource: 'offering' });
    navigate('/book');
  };

  const servicesList = [
    {
      title: "Somatic Healing",
      icon: <Heart className="w-8 h-8 text-[#CBAE73]" />,
      shortDesc: "Release stored tension and chronic patterns of stress from the body's tissues.",
      fullDesc: "Somatic healing connects the mind and physical body to safely discharge accumulated trauma, restore somatic resonance, and open pathways to organic, embodied transformation.",
      benefits: ["Trauma & tension release", "Greater physical embodiment", "Chronic pain mitigation"]
    },
    {
      title: "Breathwork",
      icon: <Wind className="w-8 h-8 text-[#CBAE73]" />,
      shortDesc: "Harness the power of conscious breathing to restore energetic flow.",
      fullDesc: "Guided breathwork journeys utilize rhythmic breathing techniques to alter consciousness, release emotional blocks, and elevate biological energy systems.",
      benefits: ["Deep emotional release", "Oxygenation & cellular vitality", "Expanded awareness"]
    },
    {
      title: "Nervous System Regulation",
      icon: <ShieldCheck className="w-8 h-8 text-[#CBAE73]" />,
      shortDesc: "Shift from chronic fight-or-flight into states of safety and ease.",
      fullDesc: "Nervous system regulation uses vagal nerve toning, grounding, and gentle somatic sequences to re-pattern high-stress reactivity and invite long-term nervous system restoration.",
      benefits: ["Reduced anxiety & panic", "Enhanced vagal tone", "Improved sleep quality"]
    },
    {
      title: "Meditation",
      icon: <Sparkles className="w-8 h-8 text-[#CBAE73]" />,
      shortDesc: "Quiet the mind and anchor your consciousness into present moment stillness.",
      fullDesc: "Experience premium guided meditations and silence-infused containers designed to help you drop beneath intellectual chatter and merge with your natural inner stillness.",
      benefits: ["Profound mental clarity", "Stress recovery", "Spiritual grounding"]
    },
    {
      title: "Wellness Coaching",
      icon: <Compass className="w-8 h-8 text-[#CBAE73]" />,
      shortDesc: "Integrate somatic wisdom into daily habits and holistic lifestyle paths.",
      fullDesc: "Wellness coaching provides structured, trauma-informed support to bridge the gap between deep ritual transformation and your everyday routines and personal relationships.",
      benefits: ["Actionable lifestyle design", "Integration support", "Sustainable self-care rituals"]
    }
  ];

  return (
    <div className="min-h-screen bg-cream selection:bg-gold/30">
      <SEOMetadata 
        title="Restorative Somatic & Wellness Services | LumaFlow"
        description="Experience luxury somatic healing, conscious breathwork, nervous system regulation, guided meditation, and wellness coaching at LumaFlow's private Soho sanctuary."
        keywords="somatic healing Soho, luxury breathwork NYC, nervous system regulation, meditation nyc, wellness coaching, LumaFlow services"
      />

      {/* 1. HERO SECTION */}
      <section className="relative pt-36 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-cream to-cream pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <div className="inline-block px-4 py-1.5 bg-[#CBAE73]/10 text-[#CBAE73] rounded-full text-[10px] font-bold uppercase tracking-[0.3em]">
              Sacred Offerings
            </div>
            <h1 className="font-display text-5xl md:text-8xl text-[#3A3A3A] leading-[1.1] tracking-tight">
              Somatic Restoration & <br />
              <span className="italic text-[#CBAE73] font-normal">Wellness Services</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#3A3A3A]/60 font-light max-w-2xl mx-auto leading-relaxed italic pt-4">
              "We guide you down from the intellect and back into the healing pathways of the body."
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. SERVICES LIST */}
      <section className="pb-36 px-6">
        <div className="max-w-7xl mx-auto space-y-24">
          {servicesList.map((service, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-16 lg:gap-24 p-8 sm:p-12 rounded-[3.5rem] bg-white/50 border border-white/80 backdrop-blur-md shadow-[0_20px_50px_rgba(203,174,115,0.05)]`}
              >
                {/* Left: Icon and Title Block */}
                <div className="w-full lg:w-1/2 space-y-8 text-left">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#F8F5F0] flex items-center justify-center shadow-inner">
                      {service.icon}
                    </div>
                    <h2 className="font-display text-3xl sm:text-4xl text-[#3A3A3A] font-light tracking-tight">
                      {service.title}
                    </h2>
                  </div>
                  
                  <p className="text-lg text-[#3A3A3A]/80 font-light leading-relaxed">
                    {service.fullDesc}
                  </p>
                  
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {service.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-3 text-text-dark/70 text-xs">
                        <div className="w-5 h-5 rounded-full bg-[#CBAE73]/10 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#CBAE73]" />
                        </div>
                        <span className="font-medium tracking-wide">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right: CTA Card */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-[#F8F5F0]/60 border border-[#3A3A3A]/5 rounded-[2.5rem] p-10 space-y-6 text-center">
                  <span className="text-[9px] font-bold text-[#CBAE73] uppercase tracking-[0.4em]">Sanctuary Pathway</span>
                  <p className="text-sm text-[#3A3A3A]/50 font-light italic px-4">
                    "Step out of reactivity and return to the deep, silent wisdom of your original self."
                  </p>
                  <button
                    onClick={() => handleBookClick(service.title)}
                    className="w-full sm:w-auto px-10 py-5 bg-[#CBAE73] text-black rounded-full text-xs font-bold uppercase tracking-[0.3em] hover:scale-105 transition-all duration-500 shadow-[0_15px_30px_rgba(203,174,115,0.2)] cursor-pointer"
                  >
                    Book {service.title} Session
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3. TRUST & SOCIAL TESTIMONIAL GRID */}
      <section className="py-24 px-6 bg-[#F8F5F0]">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-[#CBAE73] fill-[#CBAE73]" />
            ))}
          </div>
          <blockquote className="font-display text-3xl md:text-4xl text-[#3A3A3A] italic leading-relaxed">
            "Somatic restoration is not about changing yourself — it is about shedding the adaptive layers and returning to your own quiet power."
          </blockquote>
          <p className="text-[#CBAE73] text-xs font-bold uppercase tracking-[0.4em]">— LumaFlow Guide</p>
        </div>
      </section>
    </div>
  );
}
