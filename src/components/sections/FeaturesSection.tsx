'use client'

import { Shield, Database, Users, Clock, CheckCircle, AlertTriangle } from 'lucide-react'

export function FeaturesSection() {
  const features = [
    {
      icon: Shield,
      title: "Three-Tier Security",
      description: "Frontend, Application Logic (Supabase Edge Functions), and Data tiers ensure maximum security.",
      color: "text-noble-gold"
    },
    {
      icon: Database,
      title: "Secure Data Layer",
      description: "All sensitive operations routed through protected Edge Functions, never directly from frontend.",
      color: "text-noble-gold"
    },
    {
      icon: Users,
      title: "Tier-Based Allocations",
      description: "Stake $NPAD tokens to unlock Bronze, Silver, Gold tiers with guaranteed allocation limits.",
      color: "text-noble-gold"
    },
    {
      icon: Clock,
      title: "Hybrid Vesting",
      description: "Customizable vesting schedules protect investors with gradual token releases.",
      color: "text-noble-gold"
    },
    {
      icon: CheckCircle,
      title: "Liquidity Locks",
      description: "Mandatory liquidity locking ensures project commitment and investor protection.",
      color: "text-noble-gold"
    },
    {
      icon: AlertTriangle,
      title: "Anti-Rug Measures",
      description: "Multiple layers of protection including KYC verification and community governance.",
      color: "text-noble-gold"
    }
  ]

  return (
    <section className="py-20 bg-noble-gray/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold noble-text-gradient mb-6">
            Built for Maximum Trust
          </h2>
          <p className="text-xl text-noble-gold/70 max-w-3xl mx-auto">
            NoblePad implements industry-leading security measures and anti-rug protection 
            to create the safest launchpad experience for both projects and investors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div 
                key={index} 
                className="noble-card hover:shadow-xl hover:shadow-noble-gold/10 transition-all duration-300 group"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-noble-gold/10 rounded-lg flex items-center justify-center group-hover:bg-noble-gold/20 transition-colors duration-300">
                      <IconComponent className={`w-6 h-6 ${feature.color}`} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-3 text-noble-gold">
                      {feature.title}
                    </h3>
                    <p className="text-noble-gold/70 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}