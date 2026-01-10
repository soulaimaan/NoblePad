'use client'

export function StatsSection() {
  const stats = [
    {
      value: "$2.5M+",
      label: "Total Volume Raised",
      description: "Across all successful presales"
    },
    {
      value: "24",
      label: "Projects Launched",
      description: "With 100% liquidity locked"
    },
    {
      value: "1,250+",
      label: "Active Investors",
      description: "Trust Belgrave for launches"
    },
    {
      value: "0",
      label: "Rug Pulls",
      description: "Thanks to our protection measures"
    }
  ]

  return (
    <section className="py-20 bg-noble-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold noble-text-gradient mb-6">
            Proven Track Record
          </h2>
          <p className="text-xl text-noble-gold/70">
            Numbers that speak for our commitment to security and success
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="noble-card hover:shadow-xl hover:shadow-noble-gold/10 transition-all duration-300">
                <div className="text-4xl md:text-5xl font-bold noble-text-gradient mb-4 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-xl font-semibold text-noble-gold mb-2">
                  {stat.label}
                </div>
                <div className="text-noble-gold/60 text-sm">
                  {stat.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}