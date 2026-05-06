import { motion } from 'framer-motion';
import { Wind, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';

export default function Classes() {
  const openBooking = useBookingStore(state => state.openBooking);

  const services = [
    {
      title: "Breathwork",
      icon: <Wind className="w-8 h-8 text-[#CBAE73]" />,
      description: "Conscious breathing techniques to regulate your nervous system and release emotional blockages.",
      image: "/classes-image.png",
      benefits: ["Stress reduction", "Mental clarity", "Emotional release"],
      layout: "left"
    },
    {
      title: "Somatic Movement",
      icon: <Heart className="w-8 h-8 text-[#CBAE73]" />,
      description: "Gently connect with your body's innate wisdom through mindful, grounded movement practices.",
      image: "/about-image.png",
      benefits: ["Body awareness", "Trauma release", "Physical grounding"],
      layout: "right"
    },
    {
      title: "Meditation",
      icon: <Sparkles className="w-8 h-8 text-[#CBAE73]" />,
      description: "Guided sessions to anchor your mind in stillness and cultivate profound inner peace.",
      image: "/ambient-image.png",
      benefits: ["Deep presence", "Anxiety relief", "Spiritual connection"],
      layout: "left"
    }
  ];

  return (
    <div className="min-h-screen bg-cream selection:bg-gold/30">
      {/* HERO SECTION */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-cream to-cream pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-display text-5xl md:text-8xl text-[#3A3A3A] mb-8 leading-[1.1] tracking-tight">
              Your Path to <br />
              <span className="italic text-[#CBAE73]">Inner Alignment</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#3A3A3A]/60 font-light max-w-2xl mx-auto leading-relaxed italic">
              "Choose the practice that meets you where you are."
            </p>
          </motion.div>
        </div>
      </section>

      {/* SERVICE CARDS (Quick Overview) */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2, duration: 0.8 }}
              className="group bg-white/60 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/40 shadow-sm hover:shadow-[0_30px_60px_rgba(203,174,115,0.1)] hover:border-[#CBAE73]/20 transition-all duration-700 text-center"
            >
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-[#F8F5F0] flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                  {service.icon}
                </div>
              </div>
              <h3 className="font-display text-2xl text-[#3A3A3A] mb-4">{service.title}</h3>
              <p className="text-sm text-[#3A3A3A]/60 font-light leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* DETAILED SECTIONS */}
      <section className="space-y-32 pb-48">
        {services.map((service, idx) => (
          <div key={service.title} className="px-6">
            <div className={`max-w-7xl mx-auto flex flex-col ${service.layout === 'right' ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16 lg:gap-32`}>
              {/* Image Side */}
              <motion.div
                initial={{ opacity: 0, x: service.layout === 'left' ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2 }}
                className="w-full lg:w-1/2 relative group"
              >
                <div className="absolute inset-0 bg-[#CBAE73]/10 rounded-[3rem] translate-x-4 translate-y-4 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-700" />
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-[500px] object-cover rounded-[3rem] relative z-10 shadow-luxury"
                />
              </motion.div>

              {/* Text Side */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="w-full lg:w-1/2 space-y-8"
              >
                <div className="inline-block px-4 py-1.5 bg-[#CBAE73]/10 text-[#CBAE73] rounded-full text-[10px] font-bold uppercase tracking-[0.3em]">
                  Service Details
                </div>
                <h2 className="font-display text-4xl md:text-6xl text-[#3A3A3A] leading-tight">
                  {service.title} <span className="italic text-[#CBAE73] font-light">Sessions</span>
                </h2>
                <p className="text-lg text-[#3A3A3A]/70 font-light leading-relaxed">
                  {service.description} Our sessions are held in a safe, held container designed for profound personal exploration.
                </p>
                <ul className="space-y-4">
                  {service.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-4 text-[#3A3A3A]/80">
                      <div className="w-5 h-5 rounded-full bg-[#CBAE73]/20 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-[#CBAE73]" />
                      </div>
                      <span className="font-light tracking-wide">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-6">
                  <button 
                    onClick={openBooking}
                    className="px-10 py-4 bg-[#3A3A3A] text-white rounded-full text-xs font-bold uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all duration-500 cursor-pointer"
                  >
                    Explore Session
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        ))}
      </section>

      {/* FINAL CTA */}
      <section className="py-48 px-6 bg-[#F8F5F0] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] bg-white/50 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h2 className="font-display text-5xl md:text-7xl text-[#3A3A3A] mb-8 leading-tight">
              Begin your <br />
              <span className="italic text-[#CBAE73]">journey inward</span>
            </h2>
            <p className="text-lg text-[#3A3A3A]/50 font-light mb-16 max-w-xl mx-auto">
              Spaces are intentionally limited to preserve the sacred nature of each container. Reserve your spot in our next group session.
            </p>
            <button
              onClick={openBooking}
              className="px-14 py-6 bg-[#CBAE73] text-black rounded-full text-[11px] font-bold uppercase tracking-[0.4em] shadow-[0_20px_40px_rgba(203,174,115,0.3)] hover:scale-105 transition-all duration-500 cursor-pointer"
            >
              Book Your Session
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
