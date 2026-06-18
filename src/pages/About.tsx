import { motion } from 'framer-motion';
import { Wind, Heart, Sparkles, Star } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';
import SEOMetadata from '../components/seo/SEOMetadata';

export default function About() {
  const openBooking = useBookingStore(state => state.openBooking);

  const beliefs = [
    "Healing doesn’t require fixing",
    "Your body already knows the way",
    "Stillness creates transformation"
  ];

  const methods = [
    {
      title: "Breathwork",
      icon: <Wind className="w-6 h-6 text-[#CBAE73]" />,
      desc: "Conscious breathing to regulate your nervous system."
    },
    {
      title: "Somatic Movement",
      icon: <Heart className="w-6 h-6 text-[#CBAE73]" />,
      desc: "Gentle motion to release stored emotional tension."
    },
    {
      title: "Meditation",
      icon: <Sparkles className="w-6 h-6 text-[#CBAE73]" />,
      desc: "Deep stillness to anchor into the present moment."
    }
  ];

  return (
    <div className="min-h-screen bg-white selection:bg-[#CBAE73]/30">
      <SEOMetadata 
        title="About Alanna | Founder & Somatic Guide | LumaFlow" 
        description="Meet Alanna, the founder of LumaFlow. Learn about somatic breathwork, conscious movement, and our philosophy of stillness."
        keywords="somatic guide, breathwork founder, Alanna, LumaFlow about, conscious movement, wellness coach, trauma informed"
      />
      {/* 1. HERO SECTION */}
      <section className="relative pt-48 pb-36 px-6 bg-[#F8F5F0] overflow-hidden">
        {/* Soft radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-white rounded-full blur-[120px] opacity-60" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-[#3A3A3A] mb-12 leading-tight tracking-tight">
              A space to return <br />
              <span className="italic text-[#CBAE73]">to yourself</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#3A3A3A]/50 font-light max-w-2xl mx-auto leading-relaxed italic mt-12">
              "Lumaflow is not about becoming someone new — it’s about remembering who you are."
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. FOUNDER SECTION */}
      <section className="py-40 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 lg:gap-32 items-center">
          {/* Left: Alanna Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-[#CBAE73]/10 rounded-[2.5rem] translate-x-6 translate-y-6 -z-10 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-700" />
            <img 
              src="/alanna-new.jpeg" 
              alt="Alanna - Lumaflow Guide" 
              className="w-full h-[350px] sm:h-[500px] lg:h-[650px] object-cover rounded-[2.5rem] shadow-luxury transition-transform duration-700 group-hover:scale-[1.03]"
            />
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <span className="text-[#CBAE73] text-[10px] font-bold tracking-[0.4em] uppercase">MEET YOUR GUIDE</span>
              <h2 className="font-display text-6xl md:text-7xl text-[#3A3A3A] font-light leading-tight">Alanna</h2>
              <div className="space-y-8">
                <p className="text-xl text-[#3A3A3A]/70 font-light leading-[1.8] max-w-[480px]">
                  My journey began with a single breath of awareness. Lumaflow was created as a sanctuary for those seeking to quiet the noise and reconnect with their own internal compass.
                </p>
                <p className="text-[#CBAE73] font-display text-lg italic">— Alanna, Founder</p>
              </div>
            </div>

            <div className="pt-10">
              <div className="w-16 h-[1.5px] bg-[#CBAE73]/30 mb-10" />
              <p className="font-display text-4xl text-[#3A3A3A] italic opacity-90 leading-snug max-w-[500px]">
                "You don’t need to be fixed. Only supported."
              </p>
            </div>

            <div className="pt-10">
              <button 
                onClick={openBooking}
                className="px-14 py-5 bg-[#CBAE73] text-black rounded-full text-xs font-bold uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(203,174,115,0.25)] hover:shadow-[0_25px_50px_rgba(203,174,115,0.4)] hover:scale-105 transition-all duration-700 cursor-pointer"
              >
                Begin Your Journey
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. BELIEF SYSTEM SECTION */}
      <section className="py-48 px-6 bg-[#F8F5F0] relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col items-center">
            {beliefs.map((belief, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: idx * 0.3 }}
                className="flex flex-col items-center"
              >
                {idx > 0 && (
                  <div className="w-[1.5px] h-20 bg-[#CBAE73]/30 my-16" />
                )}
                <h3 className="font-display text-4xl md:text-6xl text-[#3A3A3A] opacity-90 leading-tight">
                  {belief}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. METHOD SECTION */}
      <section className="py-40 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-32">
          <div className="space-y-6">
            <h2 className="font-display text-6xl text-[#3A3A3A] font-light">How we guide you</h2>
            <div className="w-20 h-[1.5px] bg-[#CBAE73]/30 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {methods.map((method, idx) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.2 }}
                className="p-14 rounded-[2.5rem] bg-white border border-[#3A3A3A]/5 shadow-[0_10px_40px_rgba(203,174,115,0.05)] hover:shadow-[0_30px_70px_rgba(203,174,115,0.2)] hover:-translate-y-2 transition-all duration-700 group"
              >
                <div className="w-16 h-16 rounded-full bg-[#F8F5F0] flex items-center justify-center mx-auto mb-10 group-hover:scale-110 transition-transform duration-700">
                  <div className="text-[#CBAE73] drop-shadow-[0_0_8px_rgba(203,174,115,0.3)]">
                    {method.icon}
                  </div>
                </div>
                <h4 className="font-display text-3xl text-[#3A3A3A] mb-6">{method.title}</h4>
                <p className="text-sm text-[#3A3A3A]/50 font-body font-light leading-relaxed tracking-wide max-w-xs mx-auto">
                  {method.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TRUST SECTION */}
      <section className="pb-48 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
            className="space-y-16"
          >
            <div className="flex justify-center gap-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-[#CBAE73] fill-[#CBAE73] drop-shadow-[0_0_12px_rgba(203,174,115,0.6)]" />
              ))}
            </div>
            <div className="space-y-8">
              <h3 className="font-display text-4xl md:text-5xl text-[#3A3A3A] italic leading-tight px-4">
                "Lumaflow changed my relationship with my own body. I finally feel at home in my own skin."
              </h3>
              <div className="space-y-2">
                <p className="text-[#3A3A3A] font-semibold text-lg">— Elena S.</p>
                <p className="text-xs text-[#3A3A3A]/30 uppercase tracking-[0.5em] font-black">
                  TRUSTED BY 100+ HEALING JOURNEYS
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="py-48 px-6 bg-[#F8F5F0] relative overflow-hidden">
        {/* Radial Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] bg-white rounded-full blur-[140px] opacity-70" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
          >
            <h2 className="font-display text-6xl md:text-8xl text-[#3A3A3A] mb-10 leading-tight font-light">
              Begin your <br />
              <span className="italic text-[#CBAE73]">journey inward</span>
            </h2>
            <p className="text-xl text-[#3A3A3A]/40 font-light mb-16 max-w-xl mx-auto leading-relaxed italic">
              Every practice is a return to your original state of stillness. Join us in the space between breaths.
            </p>
            <button
              onClick={openBooking}
              className="px-16 py-6 bg-[#CBAE73] text-black rounded-full text-[11px] font-bold uppercase tracking-[0.5em] shadow-[0_25px_50px_rgba(203,174,115,0.35)] hover:shadow-[0_30px_60px_rgba(203,174,115,0.5)] hover:scale-105 hover:brightness-105 transition-all duration-700 cursor-pointer"
            >
              Book Your Session
            </button>
          </motion.div>
        </div>
      </section>
    </div>

  );
}
