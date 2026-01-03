'use client'

import { useUnifiedWallet } from '@/components/providers/UnifiedWalletProvider'
import { Button } from '@/components/ui/Button'
import { xrplEscrowHandler } from '@/lib/xrpl/xrplEscrowHandler'
import {
    AlertTriangle,
    CheckCircle,
    ExternalLink,
    Lock,
    ShieldCheck,
    Timer,
    TrendingUp,
    XCircle,
    Zap
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface Milestone {
  id: number
  title: string
  percentage: number
  status: 'locked' | 'voting' | 'released' | 'disputed'
  votesApprove: number
  votesDispute: number
  deadline: string
  description: string
  proofOfWork?: string
}

interface MilestoneDashboardProps {
  projectAddress: string
  chain: 'EVM' | 'XRPL'
  totalRaised: string
  milestones?: Array<{
    title: string
    percentage: string
    deadline: string
    description: string
  }>
}

export function MilestoneDashboard({ projectAddress, chain, totalRaised, milestones: initialMilestones }: MilestoneDashboardProps) {
  const { address, isConnected, chainType } = useUnifiedWallet()
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [inactivityWarning, setInactivityWarning] = useState(false)

  useEffect(() => {
    if (initialMilestones && initialMilestones.length > 0) {
      const formattedMilestones: Milestone[] = initialMilestones.map((m, idx) => ({
        id: idx,
        title: m.title,
        percentage: parseInt(m.percentage),
        status: idx === 0 ? 'released' : 'locked', // Logic to determine status would be from contract
        votesApprove: 0,
        votesDispute: 0,
        deadline: m.deadline,
        description: m.description,
        proofOfWork: ''
      }))
      setMilestones(formattedMilestones)
      setLoading(false)
      // Simulate inactivity check
      // If last released milestone was > 5 months ago
      setInactivityWarning(true) 
      return
    }

    // Mock data for initial implementation if no milestones provided
    const mockMilestones: Milestone[] = [
      { 
        id: 0, 
        title: 'TGE Initial Release', 
        percentage: 40, 
        status: 'released', 
        votesApprove: 0, 
        votesDispute: 0, 
        deadline: '2024-05-01',
        description: 'First release of tokens for project liquidity.',
        proofOfWork: 'https://sepolia.etherscan.io/tx/...'
      },
      { 
        id: 1, 
        title: 'MVP Prototype Beta', 
        percentage: 30, 
        status: 'voting', 
        votesApprove: 65, 
        votesDispute: 5, 
        deadline: '2024-07-01',
        description: 'Launch of the Beta version of the platform.',
        proofOfWork: ''
      },
      { 
        id: 2, 
        title: 'Full Mainnet Launch', 
        percentage: 30, 
        status: 'locked', 
        votesApprove: 0, 
        votesDispute: 0, 
        deadline: '2024-10-01',
        description: 'Final release of tokens after successful platform launch.',
        proofOfWork: ''
      }
    ]
    
    setMilestones(mockMilestones)
    setLoading(false)
    
    // Simulate inactivity check
    // If last released milestone was > 5 months ago
    setInactivityWarning(true) 
  }, [initialMilestones])

  const handleVote = async (milestoneId: number, approve: boolean) => {
    if (!isConnected) {
      alert('Connect your wallet to vote')
      return
    }

    setActionLoading(milestoneId)
    try {
      if (chainType === 'xrpl') {
        // In XRPL, voting might be off-chain or on a sidechain
        // For now, we simulate the action
        console.log(`XRPL: Voting ${approve ? 'Approve' : 'Dispute'} for milestone ${milestoneId}`)
        await new Promise(r => setTimeout(r, 2000))
        alert('Your vote has been recorded on the Governance Layer (Simulation)')
      } else {
        // EVM: Call NobleMilestoneEscrow.voteForRelease
        console.log(`EVM: Voting ${approve ? 'Approve' : 'Dispute'} for milestone ${milestoneId}`)
        await new Promise(r => setTimeout(r, 2000))
        alert('Vote transaction sent to MetaMask! (Simulation)')
      }
      
      // Update local state for UI feedback
      setMilestones(prev => prev.map(m => {
        if (m.id === milestoneId) {
          return {
            ...m,
            votesApprove: approve ? m.votesApprove + 1000 : m.votesApprove,
            votesDispute: !approve ? m.votesDispute + 1000 : m.votesDispute
          }
        }
        return m
      }))
    } catch (e) {
      console.error("Voting failed", e)
    } finally {
      setActionLoading(null)
    }
  }

  const handleTriggerRefund = async () => {
    if (!isConnected || chainType !== 'xrpl') return
    
    setActionLoading(-1) // Special ID for refund
    try {
       // In XRPL, this calls EscrowCancel
       await xrplEscrowHandler.triggerInactivityRefund(address!, 12345) // Sequence mock
       alert('Escrow cancellation sent! If the timeout has passed, your XRP will return shortly.')
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return <div className="p-8 text-center text-noble-gold">Loading Governance Dashboard...</div>

  const totalReleased = milestones
    .filter(m => m.status === 'released')
    .reduce((sum, m) => sum + m.percentage, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-6 h-6 text-noble-gold" />
          <h2 className="text-2xl font-bold noble-text-gradient uppercase tracking-tight">Milestone Governance</h2>
        </div>
        
        <div className="flex items-center gap-4 bg-noble-black/60 p-3 rounded-xl border border-noble-gold/10">
          <div className="text-right">
            <div className="text-xs text-noble-gold/50">Total Funds Locked</div>
            <div className="text-lg font-bold text-noble-gold">{totalRaised}</div>
          </div>
          <div className="h-8 w-px bg-noble-gold/20" />
          <div className="text-right">
            <div className="text-xs text-noble-gold/50">Released</div>
            <div className="text-lg font-bold text-green-400">{totalReleased}%</div>
          </div>
        </div>
      </div>

      {inactivityWarning && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-1" size={20} />
          <div>
            <div className="text-yellow-400 font-bold text-sm">Caution: Project Inactivity Detected</div>
            <div className="text-yellow-400/70 text-xs">
              This project hasn't successfully released a milestone in 5 months. 
              The 180-day <b>Kill Switch</b> will be available in 30 days.
            </div>
            {chainType === 'xrpl' && (
              <Button 
                onClick={handleTriggerRefund}
                variant="outline" 
                size="sm" 
                className="mt-3 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 h-8"
              >
                {actionLoading === -1 ? 'Checking...' : 'Check Inactivity Refund Status'}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Vertical Progress Bar UI */}
      <div className="relative pl-12 space-y-12 before:absolute before:left-[1.35rem] before:top-2 before:bottom-2 before:w-0.5 before:bg-noble-gold/10">
        {milestones.map((m, idx) => (
          <div key={m.id} className="relative group">
            {/* Circle Node */}
            <div className={`absolute -left-[1.85rem] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-noble-black transition-all duration-300 z-10 
              ${m.status === 'released' ? 'border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 
                m.status === 'voting' ? 'border-yellow-500 animate-pulse' : 'border-noble-gold/20'}`}>
              {m.status === 'released' && <CheckCircle className="text-green-500" size={12} />}
              {m.status === 'voting' && <Zap className="text-yellow-500" size={12} />}
              {m.status === 'locked' && <Lock className="text-noble-gold/40" size={12} />}
            </div>

            <div className={`noble-card p-6 !bg-noble-black/40 border-noble-gold/10 transition-all duration-300 group-hover:border-noble-gold/30 
              ${m.status === 'voting' ? 'ring-1 ring-yellow-500/30' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-bold text-noble-gold flex items-center gap-2">
                    {m.title}
                    <span className="text-xs font-normal bg-noble-gold/10 px-2 py-0.5 rounded text-noble-gold/70">
                      {m.percentage}% Release
                    </span>
                  </h4>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center text-xs text-noble-gold/50">
                      <Timer size={12} className="mr-1" />
                      Deadline: {m.deadline}
                    </div>
                    {m.proofOfWork && (
                      <a href={m.proofOfWork} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        <ExternalLink size={12} className="mr-1" />
                        View Proof of Work
                      </a>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-xs font-bold uppercase tracking-wider 
                    ${m.status === 'released' ? 'text-green-400' : 
                      m.status === 'voting' ? 'text-yellow-400' : 'text-noble-gold/30'}`}>
                    {m.status}
                  </div>
                </div>
              </div>

              {m.status === 'voting' && (
                <div className="mt-4 pt-4 border-t border-noble-gold/10">
                  <div className="bg-noble-gold/5 p-4 rounded-xl mb-4 border border-noble-gold/10">
                    <div className="text-[10px] uppercase font-bold text-noble-gold/40 mb-2 flex items-center gap-1">
                      <Zap size={10} /> Milestone Evidence
                    </div>
                    <p className="text-sm text-noble-gold/80 italic">
                      "{m.description}"
                    </p>
                    <div className="mt-3 flex gap-2">
                       <Button variant="outline" size="sm" className="h-7 text-[10px] border-blue-500/20 text-blue-400">
                          View Github PR
                       </Button>
                       <Button variant="outline" size="sm" className="h-7 text-[10px] border-purple-500/20 text-purple-400">
                          View Demo Video
                       </Button>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs mb-3 text-noble-gold/70 font-medium">
                    <span className="flex items-center gap-1">
                      <TrendingUp size={12} className="text-green-400" /> 
                      Approval Rate: {((m.votesApprove / (m.votesApprove + m.votesDispute || 1)) * 100).toFixed(1)}%
                    </span>
                    <span className="text-red-400">Disputes: {m.votesDispute.toLocaleString()}</span>
                  </div>
                  
                  <div className="w-full h-3 bg-noble-black rounded-full overflow-hidden flex shadow-inner border border-noble-gold/5">
                    <div 
                      className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,197,94,0.4)]" 
                      style={{ width: `${(m.votesApprove / (m.votesApprove + m.votesDispute || 1)) * 100}%` }}
                    ></div>
                    <div 
                      className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-1000 ease-out" 
                      style={{ width: `${(m.votesDispute / (m.votesApprove + m.votesDispute || 1)) * 100}%` }}
                    ></div>
                  </div>

                  <div className="mt-3 text-[10px] text-center text-noble-gold/30">
                    Quorum: 50% Required • Voting ends in 48 hours
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button 
                      disabled={actionLoading === m.id}
                      onClick={() => handleVote(m.id, true)}
                      className="flex-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                      {actionLoading === m.id ? '...' : <CheckCircle size={18} />}
                      APPROVE RELEASE
                    </Button>
                    <Button 
                      disabled={actionLoading === m.id}
                      onClick={() => handleVote(m.id, false)}
                      className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                      {actionLoading === m.id ? '...' : <XCircle size={18} />}
                      DISPUTE
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
