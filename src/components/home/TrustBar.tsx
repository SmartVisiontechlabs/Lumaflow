import { motion } from 'framer-motion';

export default function TrustBar() {
  return (
    <section className="bg-cream py-24 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="flex flex-col items-center gap-8"
        >
          <span className="text-text-dark/30 text-xs font-medium tracking-[0.4em] uppercase">
            Trusted by 100+ healing journeys worldwide
          </span>
          <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent shadow-[0_0_12px_rgba(214,179,106,0.3)]" />
        </motion.div>
      </div>
    </section>
  );
}

