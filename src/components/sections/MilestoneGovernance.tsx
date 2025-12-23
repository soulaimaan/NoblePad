'use client'

import { CheckCircle, Clock, Lock, XCircle } from 'lucide-react';
import { useState } from 'react';

interface Milestone {
  id: number;
  title: string;
  percentage: number;
  status: 'locked' | 'voting' | 'released' | 'disputed';
  votesApprove: number;
  votesDispute: number;
}

export function MilestoneGovernance() {
  const [milestones] = useState<Milestone[]>([
    { id: 1, title: 'TGE Initial Release', percentage: 40, status: 'released', votesApprove: 1200, votesDispute: 50 },
    { id: 2, title: 'Beta MVP Deployment', percentage: 30, status: 'voting', votesApprove: 450, votesDispute: 120 },
    { id: 3, title: 'Final Global Launch', percentage: 30, status: 'locked', votesApprove: 0, votesDispute: 0 },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Lock className="w-5 h-5 text-noble-gold" />
        <h2 className="text-2xl font-bold noble-text-gradient">Project Escrow Governance</h2>
      </div>

      <div className="grid gap-4">
        {milestones.map((m) => (
          <div key={m.id} className="noble-card bg-noble-black/40 border-noble-gold/20 p-5 relative overflow-hidden group">
            <div className="flex justify-between items-center relative z-10">
              <div>
                <h4 className="font-bold text-lg text-noble-gold">{m.title}</h4>
                <p className="text-sm text-noble-gold/50">{m.percentage}% of total funds</p>
              </div>

              <div className="text-right">
                {m.status === 'released' && (
                  <span className="flex items-center text-green-400 text-sm font-bold">
                    <CheckCircle className="w-4 h-4 mr-1" /> RELEASED
                  </span>
                )}
                {m.status === 'voting' && (
                  <span className="flex items-center text-yellow-400 text-sm font-bold animate-pulse">
                    <Clock className="w-4 h-4 mr-1" /> VOTING ACTIVE
                  </span>
                )}
                {m.status === 'locked' && (
                  <span className="flex items-center text-gray-500 text-sm font-bold">
                    <Lock className="w-4 h-4 mr-1" /> PENDING
                  </span>
                )}
              </div>
            </div>

            {m.status === 'voting' && (
              <div className="mt-4 pt-4 border-t border-noble-gold/10">
                <div className="flex justify-between text-xs mb-2 text-noble-gold/70">
                  <span>Community Approval: {m.votesApprove}</span>
                  <span>Disputes: {m.votesDispute}</span>
                </div>
                <div className="w-full h-2 bg-noble-gold/10 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-green-500" 
                    style={{ width: `${(m.votesApprove / (m.votesApprove + m.votesDispute)) * 100}%` }}
                  ></div>
                  <div 
                    className="h-full bg-red-500" 
                    style={{ width: `${(m.votesDispute / (m.votesApprove + m.votesDispute)) * 100}%` }}
                  ></div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 mr-2" /> APPROVE
                  </button>
                  <button className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center">
                    <XCircle className="w-4 h-4 mr-2" /> DISPUTE
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
