'use client'

import { CreatePresaleForm } from '@/components/create/CreatePresaleForm'
import { CreatePresaleSteps } from '@/components/create/CreatePresaleSteps'
import { PresaleCreationTest } from '@/components/test/PresaleCreationTest'
import { useAccount } from '@/hooks/useCompatibleAccount'
import { AlertTriangle, Shield, TestTube } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function CreatePresalePage() {
  const { isConnected } = useAccount()
  const [currentStep, setCurrentStep] = useState(1)
  const [showTest, setShowTest] = useState(false)

  // Hydration fix
  const [isMounted, setIsMounted] = useState(false)

  // Use useEffect to ensure we are on the client
  // avoiding hydration mismatch between server (which assumes not connected)
  // and client (which might be connected via local storage)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Only show connect wallet screen AFTER mount to prevent hydration mismatch
  if (isMounted && !isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-noble-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-noble-gold" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-noble-gold mb-4">Connect Your Wallet</h1>
          <p className="text-noble-gold/70 mb-6">
            You need to connect your wallet to create a presale project on the Belgrave System.
          </p>
        </div>
      </div>
    )
  }

  // Show loading placeholder during SSR/Hydration if not connected yet
  // This matches what the server renders (or at least avoids the mismatch of "Connect Wallet" vs "Content")
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-noble-black">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-noble-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-noble-gold/70">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold noble-text-gradient mb-4">
            Create Presale
          </h1>
          <p className="text-xl text-noble-gold/70 mb-6">
            Launch your project with maximum security and anti-rug protection
          </p>

          {/* Security Notice */}
          <div className="noble-card max-w-2xl mx-auto">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="text-noble-gold mt-1 flex-shrink-0" size={20} />
              <div className="text-left">
                <h3 className="font-semibold text-noble-gold mb-2">Security Requirements</h3>
                <ul className="text-sm text-noble-gold/70 space-y-1">
                  <li>• KYC verification required for all project creators</li>
                  <li>• Minimum 60% liquidity lock for 6+ months mandatory</li>
                  <li>• Team tokens must be locked for minimum 12 months</li>
                  <li>• Smart contract audit report required</li>
                  <li>• All submissions reviewed by Belgrave System team</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Test Section Toggle */}
        <div className="text-center mb-6">
          <button
            onClick={() => setShowTest(!showTest)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-blue-400 transition-colors"
          >
            <TestTube size={16} />
            <span>{showTest ? 'Hide' : 'Show'} System Test</span>
          </button>
        </div>

        {showTest && (
          <div className="mb-8">
            <PresaleCreationTest />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Steps Sidebar */}
          <div className="lg:col-span-1">
            <CreatePresaleSteps currentStep={currentStep} />
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            <CreatePresaleForm currentStep={currentStep} onStepChange={setCurrentStep} />
          </div>
        </div>
      </div>
    </div>
  )
}