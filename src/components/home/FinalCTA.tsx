import { motion } from 'framer-motion';
import { useBookingStore } from '../../store/bookingStore';

export default function FinalCTA() {
  const openBooking = useBookingStore(state => state.openBooking);
  
  return (
    <>
      <div className="section-transition" />
      <section className="relative py-72 overflow-hidden bg-transparent flex items-center justify-center">
        {/* Massive Emotional Glow */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] bg-[#CBAE73]/12 rounded-full blur-[140px] animate-breathe pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-[radial-gradient(circle,rgba(203,174,115,0.14),transparent_70%)] pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center space-y-16"
          >
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl text-text-dark font-light leading-[1.1] tracking-tight">
              Your healing begins the <br className="hidden md:block" />
              moment <span className="italic text-[#CBAE73] animate-glow">you choose it.</span>
            </h2>
            
            <motion.button 
              onClick={openBooking}
              whileHover={{ y: -4, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden bg-[#CBAE73] text-black px-20 py-8 rounded-full text-[11px] font-bold tracking-[0.4em] uppercase transition-all duration-[600ms] shadow-[0_20px_50px_rgba(203,174,115,0.2)] hover:shadow-[0_25px_60px_rgba(203,174,115,0.45)] hover:bg-[#DBC088] flex items-center justify-center cursor-pointer"
            >
              <span className="relative z-10">Book Your First Session</span>
              
              {/* Shimmer light sweep animation on hover */}
              <span 
                className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none"
              />
            </motion.button>
            
            {/* Absolute Readability text contrast boost */}
            <p className="font-body text-xs text-text-dark/65 tracking-[0.3em] uppercase">
              A safe space awaits you.
            </p>
          </motion.div>
        </div>
        
        {/* Light drifting particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`absolute w-1 h-1 bg-[#CBAE73]/25 rounded-full blur-[1px] animate-drift delay-${i * 1000}`} style={{ left: i * 12 + '%', top: i * 8 + '%' }} />
          ))}
        </div>
      </section>
    </>
  );
}


