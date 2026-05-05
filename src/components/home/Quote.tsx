import { motion } from 'framer-motion';

export default function Quote() {
  return (
    <section className="py-64 px-6 bg-cream flex items-center justify-center text-center overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, filter: 'blur(15px)' }}
        whileInView={{ opacity: 1, filter: 'blur(0px)' }}
        viewport={{ once: true }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="max-w-4xl mx-auto flex flex-col items-center"
      >
        <blockquote className="font-display text-2xl md:text-3xl lg:text-4xl italic leading-[1.6] text-text-dark/80 mb-16">
          “Be patient toward all that is unsolved in your heart and try to love the questions themselves.”
        </blockquote>
        
        {/* Minimal Decorative Element */}
        <motion.div 
          initial={{ height: 0 }}
          whileInView={{ height: 64 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 1 }}
          className="w-px bg-gold/40 mb-12"
        />

        <motion.p 
          initial={{ opacity: 0, letterSpacing: '0.6em' }}
          whileInView={{ opacity: 1, letterSpacing: '0.4em' }}
          viewport={{ once: true }}
          transition={{ duration: 2, delay: 1.2 }}
          className="text-[10px] tracking-[0.4em] uppercase text-text-dark/40 font-semibold"
        >
          Rainer Maria Rilke
        </motion.p>
      </motion.div>
    </section>
  );
}
