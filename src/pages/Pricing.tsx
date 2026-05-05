export default function Pricing() {
  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen relative">
      <div className="absolute top-0 right-0 w-1/2 h-96 opacity-10 -z-10 pointer-events-none">
        <img src="/pricing-image.png" alt="" className="w-full h-full object-cover mix-blend-luminosity rounded-bl-full" />
      </div>
      
      <div className="text-center mb-20 animate-fade-in">
        <h1 className="font-display text-5xl md:text-7xl text-text-dark mb-6">Investment</h1>
        <p className="text-lg text-text-dark/70 max-w-2xl mx-auto">Commit to your wellness journey with our flexible options.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto animate-fade-in delay-200">
        {[
          { title: "Drop-in", price: "$35", desc: "Single class access" },
          { title: "Monthly", price: "$150", desc: "Unlimited classes", highlighted: true },
          { title: "10-Class Pass", price: "$300", desc: "Valid for 6 months" }
        ].map((tier, idx) => (
          <div key={idx} className={`p-10 rounded-3xl transition-transform hover:-translate-y-2 ${tier.highlighted ? 'bg-gold text-white shadow-2xl scale-105' : 'glass border border-gold/20'}`}>
            <h3 className={`font-display text-2xl mb-2 ${tier.highlighted ? 'text-white' : 'text-text-dark'}`}>{tier.title}</h3>
            <div className="text-4xl font-light mb-6">{tier.price}</div>
            <p className={`mb-8 ${tier.highlighted ? 'text-white/80' : 'text-text-dark/60'}`}>{tier.desc}</p>
            <button className={`w-full py-3 rounded-full font-semibold tracking-wider uppercase text-sm transition-colors ${tier.highlighted ? 'bg-white text-gold hover:bg-cream' : 'bg-text-dark text-white hover:bg-gold'}`}>
              Select Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
