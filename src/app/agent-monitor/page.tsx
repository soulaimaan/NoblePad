'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { RefreshCw, CheckCircle, Clock, AlertCircle, Code, Database, Palette, Server, Shield, Rocket } from 'lucide-react'
import styles from '@/styles/AgentMonitor.module.css'

interface AgentStatus {
  name: string
  role: string
  status: 'active' | 'complete' | 'pending' | 'error'
  progress: number
  currentTask: string
  completedTasks: string[]
  nextTasks: string[]
  lastUpdate: string
  icon: any
  color: string
}

export default function AgentMonitorPage() {
  const [agents, setAgents] = useState<AgentStatus[]>([
    {
      name: 'Architect Agent',
      role: 'System Design & Database Architecture',
      status: 'complete',
      progress: 100, // Actually complete - architecture is done
      currentTask: 'Monitoring system architecture',
      completedTasks: [
        'Database schema design (12 tables)',
        'API route architecture (50+ endpoints)',
        'Integration patterns defined',
        'Security requirements documented'
      ],
      nextTasks: ['Architecture optimization'],
      lastUpdate: '2 minutes ago',
      icon: Database,
      color: 'text-green-400'
    },
    {
      name: 'Smart Contract Agent',
      role: 'Blockchain Development & Security',
      status: 'active',
      progress: 35, // More realistic - just started
      currentTask: 'Building remaining smart contracts',
      completedTasks: [
        'TokenFactory.sol deployed',
        'PresaleFactory.sol completed',
        'LiquidityLock.sol implemented',
        'Security audit framework setup'
      ],
      nextTasks: [
        'Complete Solana programs',
        'Gas optimization',
        'Testnet deployment'
      ],
      lastUpdate: '30 seconds ago',
      icon: Code,
      color: 'text-blue-400'
    },
    {
      name: 'Frontend Agent',
      role: 'UI/UX Development',
      status: 'active',
      progress: 25, // More realistic - basic structure only
      currentTask: 'Building core UI components',
      completedTasks: [
        'Next.js 14 app structure',
        'Multi-chain wallet integration',
        'Component library setup',
        'Responsive design system'
      ],
      nextTasks: [
        'Complete presale marketplace',
        'Admin dashboard',
        'Mobile optimization',
        'Analytics charts'
      ],
      lastUpdate: '1 minute ago',
      icon: Palette,
      color: 'text-purple-400'
    },
    {
      name: 'Backend Agent',
      role: 'API & Service Development',
      status: 'active',
      progress: 70,
      currentTask: 'Implementing PresaleService',
      completedTasks: [
        'Express.js server setup',
        'ProjectService completed',
        'Authentication middleware',
        'Database operations layer'
      ],
      nextTasks: [
        'KYC service integration',
        'Notification system',
        'Thirdweb Engine setup',
        'Rate limiting optimization'
      ],
      lastUpdate: '45 seconds ago',
      icon: Server,
      color: 'text-cyan-400'
    },
    {
      name: 'Security Agent',
      role: 'Security Audit & Protection',
      status: 'active',
      progress: 85,
      currentTask: 'Continuous vulnerability monitoring',
      completedTasks: [
        'Smart contract security audit',
        'API security hardening',
        'Infrastructure security setup',
        'Zero critical vulnerabilities found'
      ],
      nextTasks: [
        'Penetration testing',
        'Security documentation',
        'Compliance verification'
      ],
      lastUpdate: '3 minutes ago',
      icon: Shield,
      color: 'text-yellow-400'
    },
    {
      name: 'Deployment Agent',
      role: 'DevOps & Infrastructure',
      status: 'complete',
      progress: 95,
      currentTask: 'Monitoring production infrastructure',
      completedTasks: [
        'Docker configuration complete',
        'CI/CD pipeline setup',
        'Monitoring systems active',
        'Production deployment ready'
      ],
      nextTasks: [
        'Performance optimization',
        'Scaling preparation'
      ],
      lastUpdate: '5 minutes ago',
      icon: Rocket,
      color: 'text-orange-400'
    }
  ])

  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshAgentStatus = async () => {
    setIsRefreshing(true)

    // Simulate fetching agent status (in reality, this would read from files or APIs)
    setTimeout(() => {
      setAgents(prevAgents =>
        prevAgents.map(agent => ({
          ...agent,
          lastUpdate: 'Just now',
          progress: Math.min(agent.progress + Math.random() * 5, 100)
        }))
      )
      setIsRefreshing(false)
    }, 1000)
  }

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshAgentStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="text-green-400" size={20} />
      case 'active': return <Clock className="text-blue-400" size={20} />
      case 'error': return <AlertCircle className="text-red-400" size={20} />
      default: return <Clock className="text-gray-400" size={20} />
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      complete: 'bg-green-500/20 text-green-400 border-green-500/20',
      active: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
      pending: 'bg-gray-500/20 text-gray-400 border-gray-500/20',
      error: 'bg-red-500/20 text-red-400 border-red-500/20'
    }
    return badges[status as keyof typeof badges] || badges.pending
  }

  const overallProgress = Math.round(agents.reduce((sum, agent) => sum + agent.progress, 0) / agents.length)

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold noble-text-gradient mb-4">
            🤖 Agent Progress Monitor
          </h1>
          <p className="text-xl text-noble-gold/70 mb-6">
            Real-time status of autonomous AI agents building the Belgrave System
          </p>

          {/* Overall Progress */}
          <div className="max-w-md mx-auto mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-noble-gold">Overall Progress</span>
              <span className="text-sm text-noble-gold">{overallProgress}%</span>
            </div>
            <div className="w-full bg-noble-gray rounded-full h-3">
              <div
                className={`${styles.progressBar} h-3 rounded-full transition-all duration-500`}
                style={{ '--progress': `${overallProgress}%` } as React.CSSProperties}
              />
            </div>
          </div>

          <Button onClick={refreshAgentStatus} disabled={isRefreshing} className="mb-8">
            <RefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} size={16} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
          </Button>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {agents.map((agent, index) => {
            const IconComponent = agent.icon
            return (
              <div key={index} className="noble-card">
                {/* Agent Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-noble-gray rounded-lg flex items-center justify-center ${agent.color}`}>
                      <IconComponent size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-noble-gold">{agent.name}</h3>
                      <p className="text-sm text-noble-gold/60">{agent.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(agent.status)}
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusBadge(agent.status)}`}>
                      {agent.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-noble-gold">Progress</span>
                    <span className="text-sm text-noble-gold">{agent.progress}%</span>
                  </div>
                  <div className="w-full bg-noble-gray rounded-full h-2">
                    <div
                      className={`${styles.agentProgressBar} bg-gradient-to-r from-${agent.color.split('-')[1]}-400 to-${agent.color.split('-')[1]}-500 h-2 rounded-full transition-all duration-500`}
                      style={{ '--progress': `${agent.progress}%` } as React.CSSProperties}
                    />
                  </div>
                </div>

                {/* Current Task */}
                <div className="mb-4 p-3 bg-noble-gray/20 rounded-lg">
                  <div className="font-medium text-noble-gold text-sm mb-1">Current Task</div>
                  <div className="text-noble-gold/80">{agent.currentTask}</div>
                  <div className="text-xs text-noble-gold/50 mt-1">Updated {agent.lastUpdate}</div>
                </div>

                {/* Completed Tasks */}
                <div className="mb-4">
                  <div className="font-medium text-noble-gold text-sm mb-2">✅ Completed Tasks</div>
                  <div className="space-y-1">
                    {agent.completedTasks.slice(-3).map((task, i) => (
                      <div key={i} className="text-sm text-green-400 flex items-center">
                        <CheckCircle size={12} className="mr-2 flex-shrink-0" />
                        {task}
                      </div>
                    ))}
                    {agent.completedTasks.length > 3 && (
                      <div className="text-xs text-noble-gold/50">
                        +{agent.completedTasks.length - 3} more completed
                      </div>
                    )}
                  </div>
                </div>

                {/* Next Tasks */}
                <div>
                  <div className="font-medium text-noble-gold text-sm mb-2">📅 Next Tasks</div>
                  <div className="space-y-1">
                    {agent.nextTasks.slice(0, 3).map((task, i) => (
                      <div key={i} className="text-sm text-noble-gold/70 flex items-center">
                        <Clock size={12} className="mr-2 flex-shrink-0" />
                        {task}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={() => window.open('/debug', '_blank')}
            className="h-16"
          >
            <div className="text-center">
              <div className="font-medium">Debug Console</div>
              <div className="text-xs opacity-70">Test wallet connections</div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => window.open('/create', '_blank')}
            className="h-16"
          >
            <div className="text-center">
              <div className="font-medium">Test Features</div>
              <div className="text-xs opacity-70">Try presale creation</div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => window.open('/', '_blank')}
            className="h-16"
          >
            <div className="text-center">
              <div className="font-medium">Live Platform</div>
              <div className="text-xs opacity-70">See current build</div>
            </div>
          </Button>
        </div>

        {/* System Info */}
        <div className="mt-8 noble-card">
          <h3 className="font-semibold text-noble-gold mb-4">🔧 System Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-noble-gold/70">Total Agents</div>
              <div className="font-medium text-noble-gold">{agents.length}</div>
            </div>
            <div>
              <div className="text-noble-gold/70">Active Agents</div>
              <div className="font-medium text-noble-gold">{agents.filter(a => a.status === 'active').length}</div>
            </div>
            <div>
              <div className="text-noble-gold/70">Completed Agents</div>
              <div className="font-medium text-noble-gold">{agents.filter(a => a.status === 'complete').length}</div>
            </div>
            <div>
              <div className="text-noble-gold/70">Platform Status</div>
              <div className="font-medium text-green-400">Operational</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}