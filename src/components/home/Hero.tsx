import { motion } from 'framer-motion';
import { useBookingStore } from '../../store/bookingStore';

export default function Hero() {
  const openBooking = useBookingStore(state => state.openBooking);

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-cream section-fade-bottom">

      {/* Cinematic Background with Breathing Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center animate-breathe-slow"
        />

        {/* Readability Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8F5F0] via-transparent to-transparent opacity-80" />
        <div className="absolute inset-0 bg-[#CBAE73]/5 mix-blend-soft-light" />

        {/* Soft Golden Light */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] radial-glow animate-soft-pulse opacity-30" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] radial-glow animate-soft-pulse delay-1000 opacity-30" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * 100 + "%", y: Math.random() * 100 + "%", opacity: 0 }}
            animate={{
              y: ["0%", "-20%", "0%"],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className="absolute w-1 h-1 bg-[#CBAE73] rounded-full blur-[1px]"
          />
        ))}
      </div>

      {/* CONTENT */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >

          {/* Headline */}
          <div className="mb-10 space-y-4">
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-white leading-tight tracking-tight [text-shadow:0px_4px_24px_rgba(0,0,0,0.35)]">
              Return to your <br />
              <span className="italic text-[#CBAE73]">natural state</span> of calm.
            </h1>

            <p className="font-display text-2xl md:text-3xl text-white/80 italic [text-shadow:0px_2px_12px_rgba(0,0,0,0.25)]">
              Release. Breathe. Realign.
            </p>
          </div>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/70 font-body font-light max-w-[600px] mx-auto leading-relaxed tracking-wide mb-16 [text-shadow:0px_1px_8px_rgba(0,0,0,0.2)]">
            Guided breathwork, somatic movement, and deep inner alignment — designed to help you release what no longer serves you.
          </p>

          {/* CTA */}
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">

              <button
                onClick={openBooking}
                className="px-12 py-5 bg-[#CBAE73] text-black rounded-full text-sm font-bold tracking-[0.2em] uppercase transition-all duration-700 shadow-[0_20px_40px_rgba(203,174,115,0.4)] hover:shadow-xl hover:scale-105 relative group overflow-hidden"
              >
                <span className="relative z-10">Book Your First Session</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
              </button>

              <button className="px-12 py-5 rounded-full text-sm font-bold tracking-[0.2em] uppercase text-white border border-white/50 bg-white/10 backdrop-blur-md hover:scale-105 hover:shadow-xl transition-all duration-700">
                Explore Programs
              </button>
            </div>

            <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-medium">
              Limited spots available each week
            </p>
          </div>

        </motion.div>
      </div>

      {/* Bottom Light Flow */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F8F5F0] to-transparent pointer-events-none" />

    </section>
  );
}