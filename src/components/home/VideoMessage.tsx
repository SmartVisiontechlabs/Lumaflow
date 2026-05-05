import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export default function VideoMessage() {
  return (
    <>
      <div className="section-transition" />
      <section className="py-48 bg-cream relative section-fade-top section-fade-bottom overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full aspect-video rounded-2xl overflow-hidden group cursor-pointer shadow-luxury hover:scale-[1.02] transition-transform duration-700"
          >
            {/* Warmer Sunset/Meditation Scene */}
            <img 
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2099&auto=format&fit=crop" 
              alt="Experience Lumaflow"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            
            {/* Soft Golden Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#CBAE73]/20 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700"></div>
            
            {/* Play Button with Soft Pulse */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <motion.div 
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -inset-8 bg-[#CBAE73]/30 rounded-full blur-xl"
                />
                
                <div className="relative w-24 h-24 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center shadow-luxury group-hover:bg-white/40 transition-all duration-700">
                  <Play className="w-10 h-10 text-white fill-white ml-1.5" />
                </div>
              </div>
            </div>
            
            {/* Floating Light Particles inside Video Card */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`absolute w-1 h-1 bg-[#CBAE73]/40 rounded-full blur-[1px] animate-drift delay-${i * 1000}`} style={{ left: i * 25 + '%', top: i * 15 + '%' }} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Background glow for depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] radial-glow opacity-5" />
      </section>
    </>
  );
}


