import { motion } from 'framer-motion';
import { useBookingStore } from '../../store/bookingStore';

export default function FinalCTA() {
  const openBooking = useBookingStore(state => state.openBooking);
  
  return (
    <>
      <div className="section-transition" />
      <section className="relative py-64 overflow-hidden bg-gradient-to-b from-white to-[#F8F5F0] flex items-center justify-center section-fade-top">
        {/* Massive Emotional Glow */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] bg-[#CBAE73]/15 rounded-full blur-[150px] animate-breathe pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-[radial-gradient(circle,rgba(203,174,115,0.15),transparent_70%)] pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center space-y-16"
          >
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl text-text-dark font-light leading-[1.1] tracking-tight">
              Your healing begins the <br className="hidden md:block" />
              moment <span className="italic text-[#CBAE73]">you choose it.</span>
            </h2>
            
            <motion.button 
              onClick={openBooking}
              whileHover={{ y: -5, scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden bg-[#CBAE73] text-black px-16 py-7 rounded-full text-[10px] font-bold tracking-[0.4em] uppercase transition-all duration-1000 shadow-[0_30px_60px_rgba(214,179,106,0.2)] hover:shadow-[0_40px_80px_rgba(214,179,106,0.4)] flex items-center justify-center cursor-pointer"
            >
              <span className="relative z-10">Book Your First Session</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
            </motion.button>
            
            <p className="font-body text-xs text-text-dark/30 tracking-[0.3em] uppercase">
              A safe space awaits you.
            </p>
          </motion.div>
        </div>
        
        {/* Light drifting particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`absolute w-1 h-1 bg-[#CBAE73]/20 rounded-full blur-[1px] animate-drift delay-${i * 1000}`} style={{ left: i * 12 + '%', top: i * 8 + '%' }} />
          ))}
        </div>
      </section>
    </>
  );
}


