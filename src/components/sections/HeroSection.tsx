'use client'

import { Button } from '@/components/ui/Button'
import { SecurityScanner } from '@/components/ui/SecurityScanner'
import { Lock as LockIcon, Shield, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-noble-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-noble-gold/3 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        {/* Logo/Brand Section */}
        <div className="mb-8 animate-fade-in">
          <div className="w-24 h-24 bg-noble-black rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg shadow-noble-gold/20 p-2">
            <img
              src="/logo.jpg"
              alt="Belgrave Logo"
              className="w-full h-full object-contain"
            />
          </div>

          {/* New Security Scanner Integration */}
          <div className="mb-6 max-w-[320px] mx-auto">
            <SecurityScanner />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            <span className="noble-text-gradient">Belgrave System</span>
          </h1>
          <p className="text-xl md:text-2xl text-noble-gold/80 mb-8">
            The Standard for Decentralized Allocation.
          </p>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
          <div className="noble-card text-center animate-slide-in-left">
            <Shield className="w-12 h-12 text-noble-gold mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Maximum Security</h3>
            <p className="text-noble-gold/70">
              Three-tier architecture ensures all sensitive operations are secured through our application layer.
            </p>
          </div>

          <div className="noble-card text-center animate-slide-in-left [animation-delay:100ms]">
            <LockIcon className="w-12 h-12 text-noble-gold mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Anti-Rug Protection</h3>
            <p className="text-noble-gold/70">
              Mandatory liquidity locks and vesting schedules protect investors from rug pulls.
            </p>
          </div>

          <div className="noble-card text-center animate-slide-in-left [animation-delay:200ms]">
            <TrendingUp className="w-12 h-12 text-noble-gold mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Guaranteed Allocations</h3>
            <p className="text-noble-gold/70">
              Stake $BELGRAVE tokens to unlock guaranteed allocation tiers for exclusive presales.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
          <Link href="/presales">
            <Button size="lg" className="text-lg px-8 py-4">
              Explore Presales
            </Button>
          </Link>
          <Link href="/create">
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              Launch Your Project
            </Button>
          </Link>
        </div>

        {/* Stats Preview */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold noble-text-gradient mb-2">$2.5M+</div>
            <div className="text-noble-gold/60 text-sm">Total Raised</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold noble-text-gradient mb-2">24</div>
            <div className="text-noble-gold/60 text-sm">Successful Launches</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold noble-text-gradient mb-2">1,250+</div>
            <div className="text-noble-gold/60 text-sm">Active Investors</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold noble-text-gradient mb-2">100%</div>
            <div className="text-noble-gold/60 text-sm">Liquidity Locked</div>
          </div>
        </div>
      </div>
    </section>
  )
}