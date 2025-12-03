'use client'

import { MetaMaskDebugger } from '@/components/debug/MetaMaskDebugger'
import { MetaMaskConnectionFixer } from '@/components/debug/MetaMaskConnectionFixer'
import { WalletDetector } from '@/components/debug/WalletDetector'
import { ManualMetaMaskConnector } from '@/components/debug/ManualMetaMaskConnector'

export default function DebugPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold noble-text-gradient mb-4">
            MetaMask Connection Debug
          </h1>
          <p className="text-xl text-noble-gold/70">
            Diagnose and fix MetaMask connection issues
          </p>
        </div>

        <div className="space-y-8">
          <ManualMetaMaskConnector />
          <WalletDetector />
          <MetaMaskConnectionFixer />
          <MetaMaskDebugger />
        </div>
      </div>
    </div>
  )
}