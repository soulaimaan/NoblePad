'use client'

import { PresaleCard } from '@/components/presale/PresaleCard'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export function PresalePreview() {
  // Mock presale data - will be replaced with real data from Supabase
  const mockPresales = [
    {
      id: '1',
      name: 'BelgraveSwap',
      logo: '/api/placeholder/64/64',
      hardCap: '500 BNB',
      softCap: '250 BNB',
      raised: '387 BNB',
      progress: 77,
      endTime: new Date('2024-12-31'), // 5 days from now
      status: 'live' as const,
      chain: 'BSC',
      liquidityLock: '12 months',
      aiScore: 8.8
    },
    {
      id: '2',
      name: 'CryptoVault',
      logo: '/api/placeholder/64/64',
      hardCap: '300 BNB',
      softCap: '150 BNB',
      raised: '142 BNB',
      progress: 47,
      endTime: new Date('2024-12-25'), // 3 days from now
      status: 'live' as const,
      chain: 'BSC',
      liquidityLock: '6 months',
      aiScore: 7.2
    },
    {
      id: '3',
      name: 'DeFiGems',
      logo: '/api/placeholder/64/64',
      hardCap: '750 BNB',
      softCap: '400 BNB',
      raised: '0 BNB',
      progress: 0,
      endTime: new Date('2025-01-15'), // 7 days from now
      status: 'upcoming' as const,
      chain: 'ETH',
      liquidityLock: '18 months',
      aiScore: 9.1
    }
  ]

  return (
    <section className="py-20 bg-noble-gray/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold noble-text-gradient mb-6">
            Featured Presales
          </h2>
          <p className="text-xl text-noble-gold/70 mb-8">
            Discover vetted projects with guaranteed liquidity locks and anti-rug protection
          </p>
          <Link href="/presales">
            <Button size="lg" className="text-lg px-8 py-4">
              View All Presales
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockPresales.map((presale) => (
            <PresaleCard key={presale.id} presale={presale} />
          ))}
        </div>
      </div>
    </section>
  )
}