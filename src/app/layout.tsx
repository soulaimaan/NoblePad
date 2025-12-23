import dynamic from 'next/dynamic'

const Navigation = dynamic(() => import('@/components/layout/Navigation').then(mod => mod.Navigation), { ssr: false })
const Web3Provider = dynamic(() => import('@/components/providers/Web3Provider').then(mod => mod.Web3Provider), { ssr: false })
const UnifiedWalletProvider = dynamic(() => import('@/components/providers/UnifiedWalletProvider').then(mod => mod.UnifiedWalletProvider), { ssr: false })
const TierProvider = dynamic(() => import('@/components/providers/TierProvider').then(mod => mod.TierProvider), { ssr: false })
const SolanaProvider = dynamic(() => import('@/components/providers/SolanaProvider').then(mod => mod.SolanaProvider), { ssr: false })
const SupabaseProvider = dynamic(() => import('@/components/providers/SupabaseProvider').then(mod => mod.SupabaseProvider), { ssr: false })


import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NoblePad - Anti-Rug Launchpad. Powered by Trust.',
  description: 'The premier decentralized token launchpad with maximum security, anti-rug protection, and guaranteed allocations for stakers.',
  keywords: 'crypto, launchpad, presale, IDO, anti-rug, defi, blockchain, tokens',
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
            <UnifiedWalletProvider>
              <TierProvider>
                <SolanaProvider>
                  <div className="min-h-screen bg-noble-black">
                    <Navigation />
                    <main className="pt-20">
                      {children}
                    </main>
                  </div>
                </SolanaProvider>
              </TierProvider>
            </UnifiedWalletProvider>
          </Web3Provider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
