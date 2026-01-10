import { SupabaseProvider } from '@/components/providers/SupabaseProvider'
import { Web3Provider } from '@/components/providers/Web3Provider'
import { SolanaProvider } from '@/components/providers/SolanaProvider'
import dynamic from 'next/dynamic'

const Navigation = dynamic(() => import('@/components/layout/Navigation').then(mod => mod.Navigation), { ssr: false })
// UnifiedWalletProvider must be dynamic to avoid hydration mismatch with wallet state
const UnifiedWalletProvider = dynamic(() => import('@/components/providers/UnifiedWalletProvider').then(mod => mod.UnifiedWalletProvider), { ssr: false })
const TierProvider = dynamic(() => import('@/components/providers/TierProvider').then(mod => mod.TierProvider), { ssr: false })


import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Belgrave System - The Allocation Protocol',
  description: 'The standardized decentralized allocation protocol. Fair, tier-based access for the Ethereum, Base, BSC, and XRPL ecosystems.',
  keywords: 'belgrave, launchpad, staking, tiers, eth, base, bsc, xrpl',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <SupabaseProvider>
          <Web3Provider>
            <SolanaProvider>
              <UnifiedWalletProvider>
                <TierProvider>
                  <div className="min-h-screen bg-noble-black">
                    <Navigation />
                    <main className="pt-20">
                      {children}
                    </main>
                  </div>
                </TierProvider>
              </UnifiedWalletProvider>
            </SolanaProvider>
          </Web3Provider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
