import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { VanillaWeb3Provider } from '@/components/providers/VanillaWeb3Provider'
import { SolanaProvider } from '@/components/providers/SolanaProvider'
import { SupabaseProvider } from '@/components/providers/SupabaseProvider'
import { Navigation } from '@/components/layout/Navigation'

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
          <VanillaWeb3Provider>
            <SolanaProvider>
              <div className="min-h-screen bg-noble-black">
                <Navigation />
                <main className="pt-20">
                  {children}
                </main>
              </div>
            </SolanaProvider>
          </VanillaWeb3Provider>
        </SupabaseProvider>
      </body>
    </html>
  )
}