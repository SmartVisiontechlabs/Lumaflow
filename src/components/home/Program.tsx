import { motion } from 'framer-motion';

export default function Program() {
  const programs = [
    {
      title: "Breathwork",
      benefit: "Release deep tension and feel light again.",
      duration: "45 Minutes",
    },
    {
      title: "Somatic Flow",
      benefit: "Melt away physical blockages and restore fluid grace.",
      duration: "60 Minutes",
    },
    {
      title: "Deep Meditation",
      benefit: "Quiet the mental noise and anchor into profound stillness.",
      duration: "30 Minutes",
    }
  ];

  return (
    <section className="py-48 bg-white relative section-fade-top section-fade-bottom">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="text-center mb-32"
        >
          <span className="text-gold text-xs font-medium tracking-[0.3em] uppercase mb-4 block">Our Offerings</span>
          <h2 className="font-display text-5xl md:text-6xl text-text-dark font-light">
            Journeys to <span className="italic text-gold">inner calm</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {programs.map((program, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: index * 0.2 }}
              whileHover={{ y: -10 }}
              className="glass p-16 rounded-[3rem] flex flex-col items-center text-center group cursor-pointer transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(214,179,106,0.3)]"
            >
              <div className="w-full h-full absolute inset-0 rounded-[3rem] radial-glow opacity-0 group-hover:opacity-10 transition-opacity duration-1000" />
              <h3 className="text-3xl font-display text-text-dark mb-6 group-hover:text-gold transition-colors duration-700">
                {program.title}
              </h3>
              <p className="text-text-dark/50 font-body font-light mb-12 flex-grow leading-relaxed text-lg">
                {program.benefit}
              </p>
              <div className="text-sm tracking-[0.3em] uppercase text-gold font-medium border-t border-gold/10 pt-8 w-full">
                {program.duration}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

