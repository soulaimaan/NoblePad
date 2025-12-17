'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { CheckCircle, XCircle, Eye, ExternalLink, Shield, AlertTriangle } from 'lucide-react'

interface AdminPresaleReviewProps {
  activeTab: string
}

export function AdminPresaleReview({ activeTab }: AdminPresaleReviewProps) {
  const [selectedPresale, setSelectedPresale] = useState<any>(null)

  // Mock data - would come from Supabase Edge Function
  const mockPresales = {
    pending: [
      {
        id: 'ps1',
        projectName: 'DeFiVault',
        tokenSymbol: 'DVT',
        submittedDate: '2024-01-15',
        submitterAddress: '0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4',
        hardCap: '500 BNB',
        softCap: '250 BNB',
        liquidityLock: '12 months',
        kycStatus: 'submitted',
        auditStatus: 'pending_review',
        riskLevel: 'low'
      },
      {
        id: 'ps2',
        projectName: 'MetaSwap',
        tokenSymbol: 'MSP',
        submittedDate: '2024-01-14',
        submitterAddress: '0x123...',
        hardCap: '300 BNB',
        softCap: '150 BNB',
        liquidityLock: '6 months',
        kycStatus: 'incomplete',
        auditStatus: 'not_submitted',
        riskLevel: 'high'
      }
    ],
    approved: [
      {
        id: 'ps3',
        projectName: 'NobleSwap',
        tokenSymbol: 'NST',
        approvedDate: '2024-01-10',
        submitterAddress: '0x456...',
        hardCap: '500 BNB',
        status: 'live'
      }
    ]
  }

  const handleApprove = async (presaleId: string) => {
    try {
      // Call Supabase Edge Function to approve presale
      console.log('Approving presale:', presaleId)
      alert('Presale approved successfully!')
    } catch (error) {
      alert('Error approving presale')
    }
  }

  const handleReject = async (presaleId: string) => {
    const reason = prompt('Please provide a rejection reason:')
    if (!reason) return

    try {
      // Call Supabase Edge Function to reject presale
      console.log('Rejecting presale:', presaleId, 'Reason:', reason)
      alert('Presale rejected successfully!')
    } catch (error) {
      alert('Error rejecting presale')
    }
  }

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-md text-xs">Low Risk</span>
      case 'medium':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-md text-xs">Medium Risk</span>
      case 'high':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-md text-xs">High Risk</span>
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md text-xs">Submitted</span>
      case 'incomplete':
        return <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-md text-xs">Incomplete</span>
      case 'verified':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-md text-xs">Verified</span>
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-md text-xs">{status}</span>
    }
  }

  const currentPresales = mockPresales[activeTab as keyof typeof mockPresales] || []

  return (
    <div className="space-y-6">
      {currentPresales.map((presale) => (
        <div key={presale.id} className="noble-card">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <h3 className="text-xl font-semibold text-noble-gold">{presale.projectName}</h3>
                <span className="text-noble-gold/60">({presale.tokenSymbol})</span>
                {presale.riskLevel && getRiskBadge(presale.riskLevel)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <span className="text-noble-gold/70 text-sm">Submitted:</span>
                  <span className="text-noble-gold ml-2">{presale.submittedDate || presale.approvedDate}</span>
                </div>
                <div>
                  <span className="text-noble-gold/70 text-sm">Hard Cap:</span>
                  <span className="text-noble-gold ml-2">{presale.hardCap}</span>
                </div>
                <div>
                  <span className="text-noble-gold/70 text-sm">Submitter:</span>
                  <span className="text-noble-gold ml-2 font-mono text-xs">
                    {presale.submitterAddress.slice(0, 10)}...
                  </span>
                </div>
              </div>

              {activeTab === 'pending' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Shield size={16} className="text-noble-gold/60" />
                    <span className="text-noble-gold/70 text-sm">KYC:</span>
                    {getStatusBadge(presale.kycStatus)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield size={16} className="text-noble-gold/60" />
                    <span className="text-noble-gold/70 text-sm">Audit:</span>
                    {getStatusBadge(presale.auditStatus)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle size={16} className="text-noble-gold/60" />
                    <span className="text-noble-gold/70 text-sm">Lock:</span>
                    <span className="text-noble-gold text-sm">{presale.liquidityLock}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPresale(presale)}
              >
                <Eye size={16} className="mr-1" />
                Review
              </Button>
              
              {activeTab === 'pending' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(presale.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle size={16} className="mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReject(presale.id)}
                    className="text-red-400 border-red-400 hover:bg-red-400/10"
                  >
                    <XCircle size={16} className="mr-1" />
                    Reject
                  </Button>
                </>
              )}
              
              {(activeTab === 'approved' || activeTab === 'live') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/presale/${presale.id}`, '_blank')}
                >
                  <ExternalLink size={16} className="mr-1" />
                  View Live
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}

      {currentPresales.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-noble-gold/70 mb-4">
            No presales in {activeTab} status
          </p>
          <p className="text-noble-gold/50">
            Check other tabs or wait for new submissions
          </p>
        </div>
      )}

      {/* Detailed Review Modal would go here */}
      {selectedPresale && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="noble-card max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-noble-gold">
                Detailed Review: {selectedPresale.projectName}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPresale(null)}
              >
                Close
              </Button>
            </div>
            
            <div className="space-y-4 text-sm">
              <p className="text-noble-gold/70">
                Detailed review interface would show all project documentation,
                KYC documents, audit reports, and allow for detailed approval/rejection actions.
              </p>
              
              <div className="p-4 bg-noble-gray/30 rounded-lg">
                <p className="text-noble-gold">Project: {selectedPresale.projectName}</p>
                <p className="text-noble-gold/70">This is where the full project details would be displayed for review.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}