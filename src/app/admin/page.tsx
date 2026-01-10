'use client'

import { useState, useEffect } from 'react'
import { useAccount } from '@/hooks/useCompatibleAccount'
import { AdminPresaleReview } from '@/components/admin/AdminPresaleReview'
import { AdminStats } from '@/components/admin/AdminStats'
import { AdminNavigation } from '@/components/admin/AdminNavigation'
import { Shield, Lock } from 'lucide-react'

// Mock admin addresses - in real app, this would be managed by Supabase
const ADMIN_ADDRESSES = [
  '0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4',
  '0x123...' // Add real admin addresses
]

export default function AdminPage() {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState('pending')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if connected address is admin
    if (isConnected && address) {
      setIsAdmin(ADMIN_ADDRESSES.includes(address.toLowerCase()))
    }
  }, [address, isConnected])

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-noble-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-noble-gold" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-noble-gold mb-4">Admin Access Required</h1>
          <p className="text-noble-gold/70">
            Connect your admin wallet to access the Belgrave administration panel.
          </p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-red-400" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-noble-gold/70">
            Your wallet address is not authorized to access the admin panel.
          </p>
          <p className="text-xs text-noble-gold/50 mt-4 font-mono">
            Connected: {address}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold noble-text-gradient mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-noble-gold/70">
            Manage presale submissions and platform security
          </p>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <AdminStats />
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <AdminNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Main Content */}
        <AdminPresaleReview activeTab={activeTab} />
      </div>
    </div>
  )
}