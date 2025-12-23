'use client'


export function SecuritySection() {
  return (
    <section className="py-20 relative overflow-hidden bg-noble-black/50">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-noble-gold/5 rounded-full blur-[120px]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 text-left">
            <h2 className="text-3xl md:text-5xl font-bold noble-text-gradient mb-6">
              Certified Security Ecosystem
            </h2>
            <p className="text-xl text-noble-gold/80 mb-8 leading-relaxed">
              NoblePad isn't just a launchpad; it's a fortress for your capital. 
              Our smart contracts have been manually hardened and verified to 
              ensure they meet the highest anti-rug standards in DeFi.
            </p>
            
            <ul className="space-y-4 mb-8">
              {[
                "Hardcoded 60% Minimum Liquidity Lock",
                "Automated Multi-Chain MEV Protection",
                "Fixed Supply - No Minting Backdoors",
                "Automated Refund Safeguards"
              ].map((text, i) => (
                <li key={i} className="flex items-center space-x-3 text-noble-gold">
                  <span className="w-2 h-2 bg-noble-gold rounded-full shadow-[0_0_10px_rgba(212,175,55,0.8)]"></span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex-1 flex justify-center items-center">
            <div className="relative group p-4">
              <div className="absolute inset-0 bg-noble-gold/20 rounded-full blur-2xl group-hover:bg-noble-gold/30 transition-all duration-500"></div>
              <img 
                src="/security-badge.png" 
                alt="NoblePad Certified Anti-Rug Badge"
                className="w-80 h-80 relative z-10 drop-shadow-[0_0_30px_rgba(212,175,55,0.3)] group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
