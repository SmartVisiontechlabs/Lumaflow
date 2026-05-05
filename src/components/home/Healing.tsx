import { motion } from 'framer-motion';
import { Cloud, Search, Wind, Sun } from 'lucide-react';

export default function Healing() {
  const steps = [
    {
      title: "The Weight",
      description: "Recognizing the silent tension stored in the muscles and mind.",
      icon: <Cloud className="w-6 h-6" />
    },
    {
      title: "Awareness",
      description: "Softening the gaze inward to witness the rhythm of your breath.",
      icon: <Search className="w-6 h-6" />
    },
    {
      title: "Release",
      description: "Exhaling the old, creating space for new energy to flow.",
      icon: <Wind className="w-6 h-6" />
    },
    {
      title: "Alignment",
      description: "Returning to a state of profound, centered stillness.",
      icon: <Sun className="w-6 h-6" />
    }
  ];

  return (
    <>
      <div className="section-transition" />
      <section className="py-48 bg-cream relative section-fade-top section-fade-bottom">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
            className="text-center mb-32"
          >
            <span className="text-gold text-xs font-medium tracking-[0.3em] uppercase mb-4 block">The Journey</span>
            <h2 className="font-display text-5xl md:text-6xl text-text-dark font-light">
              The path to <span className="italic text-gold">transformation</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: index * 0.2 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-full bg-[#F8F5F0] flex items-center justify-center text-gold mb-8 shadow-sm group-hover:shadow-[0_10px_20px_rgba(0,0,0,0.05)] group-hover:scale-105 transition-all duration-500">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-display text-text-dark mb-4 tracking-wide">
                  {step.title}
                </h3>
                <p className="text-text-dark/40 font-body font-light leading-relaxed text-sm">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Decorative center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] radial-glow opacity-10 pointer-events-none" />
      </section>
    </>
  );
}


