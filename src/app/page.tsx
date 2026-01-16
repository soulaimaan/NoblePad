'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { AlertCircle, CheckCircle, Clock, Shield, Twitter, MessageSquare, Activity } from 'lucide-react'

// Types for our monitoring data
interface MarketingAction {
  id: string
  timestamp: string
  type: 'research' | 'audit' | 'draft' | 'publish' | 'compliance'
  status: 'success' | 'failed' | 'blocked'
  details: string
  platform?: 'twitter' | 'telegram'
  contractAddress?: string
  riskLevel?: 'low' | 'medium' | 'high'
}

interface AgentStatus {
  id: string
  name: string
  status: 'idle' | 'scanning' | 'processing' | 'cooldown' | 'active'
  task: string
  type: string
  lastActive: string
}

export default function MarketingMonitorPage() {
  const [actions, setActions] = useState<MarketingAction[]>([])
  const [agents, setAgents] = useState<AgentStatus[]>([
    { id: 'scout', name: 'Strategic Scout', status: 'active', task: 'Monitoring X.com institutional keywords', type: 'Research', lastActive: 'Just now' },
    { id: 'visionary', name: 'Visionary', status: 'active', task: 'Synthesizing technical moats', type: 'Content', lastActive: '2 min ago' },
    { id: 'auditor', name: 'Inst. Auditor', status: 'active', task: 'Filtering degen language', type: 'Compliance', lastActive: '5 min ago' },
    { id: 'networker', name: 'Networker', status: 'active', task: 'Drafting consultative replies', type: 'Outreach', lastActive: '5 min ago' },
    { id: 'manager', name: 'Engagement Lead', status: 'active', task: 'Managing Telegram community', type: 'Community', lastActive: 'Just now' },
    { id: 'guard', name: 'Algorithm Guard', status: 'active', task: 'Enforcing 3:1 ratio', type: 'Safety', lastActive: '1 min ago' },
  ]);
  const [nextScanTime, setNextScanTime] = useState<string>('00:00:00')

  // Mock data simulation - In reality this would fetch from Supabase
  useEffect(() => {
    // Initial mock data
    setActions([
      {
        id: '1',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString(),
        type: 'publish',
        status: 'success',
        details: 'Published Macro-Analysis: Institutional gateways for 2026. $BELGRAVE positioning.',
        platform: 'twitter',
        riskLevel: 'low'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toLocaleTimeString(),
        type: 'research',
        status: 'success',
        details: 'Target @balajis: Strategic insight on Network State infrastructure generated.',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toLocaleTimeString(),
        type: 'compliance',
        status: 'success',
        details: 'Algorithm Guard: 3:1 Reply ratio maintained. Organic jitter applied.',
      }
    ])

    // Calculate next scan time (90 min from now)
    const next = new Date(Date.now() + 90 * 60 * 1000)
    setNextScanTime(next.toLocaleTimeString())

  }, [])

  return (
    <div className="min-h-screen py-8 bg-noble-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold noble-text-gradient mb-2">
              🛡️ Belgrave Guardian Monitor
            </h1>
            <p className="text-noble-gold/70">
              Live tracking of autonomous marketing & security agents
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-noble-gold/60 mb-1">Next Security Scan</div>
            <div className="text-2xl font-mono text-noble-gold font-bold">{nextScanTime}</div>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {agents.map((agent) => (
            <Card key={agent.name} className="bg-noble-card border-noble-border">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className={`mb-2 p-2 rounded-full ${agent.status === 'scanning' ? 'bg-blue-500/20 text-blue-400 animate-pulse' :
                  agent.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/10 text-green-400'
                  }`}>
                  <Activity size={20} />
                </div>
                <div className="font-semibold text-noble-gold text-sm">{agent.name}</div>
                <div className="text-xs text-noble-gold/60 uppercase tracking-wider mt-1 mb-2">
                  {agent.status}
                </div>
                <div className="text-xs text-noble-gold/40">
                  {agent.lastActive}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Activity Feed */}
        <Card className="bg-noble-card border-noble-border">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-noble-gold flex items-center">
              <Clock className="mr-2" /> Live Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {actions.map((action) => (
                <div key={action.id} className="flex items-start p-4 rounded-lg bg-noble-dark/50 border border-noble-gray/20">
                  <div className="mr-4 mt-1">
                    {action.type === 'publish' && <Twitter className="text-blue-400" size={20} />}
                    {action.type === 'audit' && <Shield className="text-purple-400" size={20} />}
                    {action.type === 'compliance' && <CheckCircle className="text-green-400" size={20} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-noble-gold capitalize">
                        {action.type} Action
                        {action.status === 'failed' && <span className="ml-2 text-red-400 text-xs bg-red-400/10 px-2 py-0.5 rounded">DETECTED</span>}
                      </h4>
                      <span className="text-xs font-mono text-noble-gold/50">{action.timestamp}</span>
                    </div>
                    <p className="text-sm text-noble-gold/80 mb-2">{action.details}</p>

                    <div className="flex gap-2">
                      {action.riskLevel && (
                        <Badge variant="outline" className={
                          action.riskLevel === 'high' ? 'border-red-500 text-red-400' : 'border-yellow-500 text-yellow-400'
                        }>
                          {action.riskLevel.toUpperCase()} RISK
                        </Badge>
                      )}
                      {action.platform && (
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-400">
                          {action.platform}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}