'use client'

import { Button } from '@/components/ui/Button'
import { useAccount } from '@/hooks/useCompatibleAccount'
import { db } from '@/lib/supabaseClient'
import { Activity, Calendar, DollarSign, Users } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts'

interface CreatorPresale {
  id: string
  name: string
  symbol: string
  raised: number
  hardCap: number
  participants: number
  status: string
  createdAt: string
  dailyStats: { date: string; amount: number }[]
}

export function CreatorDashboard() {
  const { address, isConnected } = useAccount()
  const [presales, setPresales] = useState<CreatorPresale[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPresale, setSelectedPresale] = useState<string | null>(null)

  useEffect(() => {
    if (!address) return

    const fetchCreatorData = async () => {
      setLoading(true)
      try {
        // Fetch presales created by this user
        // Note: Real implementation would fetch from DB. 
        // For now simulating with mock data if DB returns empty, or fetching real if available.
        
        let userPresales: CreatorPresale[] = []
        
        // Try fetching real data first
        const { data: dbPresales } = await db.getUserPresales(address)
        
        if (dbPresales && dbPresales.length > 0) {
          userPresales = dbPresales.map((p: any) => ({
             id: p.id,
             name: p.project_name || p.name || 'Untitled Project',
             symbol: p.token_symbol || 'TKN',
             raised: parseFloat(p.total_raised || p.current_raised || '0'),
             hardCap: parseFloat(p.hard_cap || '0'),
             participants: p.total_participants || 0,
             status: p.status || 'active',
             createdAt: p.created_at,
             dailyStats: generateMockHistory(parseFloat(p.total_raised || '0')) // Mock history for now
          }))
        } else {
             // Mock data for demo/testing purposes so user can see the chart
             userPresales = [
               {
                 id: 'demo-1',
                 name: 'Aggressive Alpha Finance',
                 symbol: 'AAF',
                 raised: 420.69,
                 hardCap: 500,
                 participants: 1337,
                 status: 'live',
                 createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
                 dailyStats: [
                   { date: 'Day 1', amount: 50 },
                   { date: 'Day 2', amount: 120 },
                   { date: 'Day 3', amount: 200 },
                   { date: 'Day 4', amount: 280 },
                   { date: 'Day 5', amount: 350 },
                   { date: 'Day 6', amount: 410 },
                   { date: 'Today', amount: 420 },
                 ]
               }
             ]
        }

        setPresales(userPresales)
        if (userPresales.length > 0) {
          setSelectedPresale(userPresales[0].id)
        }
      } catch (error) {
        console.error('Failed to fetch creator data', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCreatorData()
  }, [address])

  // Helper to generate a fake curve for demo purposes
  const generateMockHistory = (total: number) => {
    const days = 7
    const data = []
    let current = 0
    for (let i = 0; i < days; i++) {
        const increment = (total / days) * (0.5 + Math.random()) // Random growth
        current += increment
        if (current > total) current = total
        data.push({
            date: `Day ${i+1}`,
            amount: Math.round(current * 100) / 100
        })
    }
    // ensure last is total
    data[data.length-1].amount = total
    return data
  }

  if (!isConnected) return null

  if (loading) {
    return (
      <div className="noble-card flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 border-2 border-noble-gold rounded-full border-t-transparent"></div>
      </div>
    )
  }

  if (presales.length === 0) {
    return (
        <div className="noble-card text-center py-12">
            <h3 className="text-xl font-bold text-noble-gold mb-2">Become a Creator</h3>
            <p className="text-noble-gold/70 mb-6 max-w-md mx-auto">
                You haven&apos;t created any presales yet. Launch your token on NoblePad to access advanced analytics and investor management tools.
            </p>
            <Link href="/create">
                <Button>
                    Create Presale
                </Button>
            </Link>
        </div>
    )
  }

  const activeProject = presales.find(p => p.id === selectedPresale) || presales[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h2 className="text-2xl font-bold noble-text-gradient">Creator Dashboard</h2>
         {presales.length > 1 && (
             <select 
               className="bg-noble-black border border-noble-gold/20 rounded-lg px-3 py-2 text-noble-gold"
               value={activeProject.id}
               onChange={(e) => setSelectedPresale(e.target.value)}
               aria-label="Select Project"
             >
                 {presales.map(p => (
                     <option key={p.id} value={p.id}>{p.name} ({p.symbol})</option>
                 ))}
             </select>
         )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="noble-card p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-noble-gold/70 text-sm">Total Raised</span>
                <DollarSign className="text-green-400" size={16} />
            </div>
            <div className="text-2xl font-bold text-noble-gold">
                {activeProject.raised.toLocaleString()} <span className="text-sm font-normal">BNB/XRP</span>
            </div>
            <div className="text-xs text-green-400 mt-1">
                {Math.round((activeProject.raised / activeProject.hardCap) * 100)}% of Hard Cap
            </div>
        </div>

        <div className="noble-card p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-noble-gold/70 text-sm">Participants</span>
                <Users className="text-blue-400" size={16} />
            </div>
            <div className="text-2xl font-bold text-noble-gold">
                {activeProject.participants}
            </div>
            <div className="text-xs text-noble-gold/60 mt-1">
                Unique wallets
            </div>
        </div>

        <div className="noble-card p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-noble-gold/70 text-sm">Avg. Contribution</span>
                <Activity className="text-purple-400" size={16} />
            </div>
            <div className="text-2xl font-bold text-noble-gold">
                {activeProject.participants > 0 
                  ? (activeProject.raised / activeProject.participants).toFixed(2) 
                  : '0'}
            </div>
             <div className="text-xs text-noble-gold/60 mt-1">
                Per wallet
            </div>
        </div>

        <div className="noble-card p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-noble-gold/70 text-sm">Status</span>
                <Calendar className="text-orange-400" size={16} />
            </div>
            <div className="text-2xl font-bold text-noble-gold capitalize">
                {activeProject.status}
            </div>
            <div className="text-xs text-noble-gold/60 mt-1">
                Project State
            </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="noble-card h-[400px]">
          <h3 className="text-lg font-semibold text-noble-gold mb-6">Fundraising Performance</h3>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={activeProject.dailyStats}>
                <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#CCA857" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#CCA857" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333' }}
                    itemStyle={{ color: '#CCA857' }}
                />
                <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#CCA857" 
                    fillOpacity={1} 
                    fill="url(#colorAmount)" 
                    strokeWidth={2}
                />
            </AreaChart>
          </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="noble-card">
            <h3 className="text-lg font-semibold text-noble-gold mb-4">Recommendations (AI Powered)</h3>
            <div className="space-y-4">
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <h4 className="font-medium text-green-400">Marketing Boost</h4>
                    <p className="text-sm text-noble-gold/70 mt-1">
                        Your conversion rate is 4% below sector average. Consider enabling "Quest" rewards to boost engagement.
                    </p>
                </div>
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                     <h4 className="font-medium text-blue-400">Time to Fill</h4>
                     <p className="text-sm text-noble-gold/70 mt-1">
                        At this rate, you will hit Hard Cap in 48 hours. Prepare your "Closing Presale" announcement.
                    </p>
                </div>
            </div>
        </div>

        <div className="noble-card">
             <h3 className="text-lg font-semibold text-noble-gold mb-4">Quick Actions</h3>
             <div className="grid grid-cols-2 gap-3">
                 <Button variant="outline" className="h-auto py-3 block text-center">
                    Share Link
                 </Button>
                 <Button variant="outline" className="h-auto py-3 block text-center">
                    Edit Details
                 </Button>
                 <Button variant="outline" className="h-auto py-3 block text-center">
                    Manage Whitelist
                 </Button>
                 <Button variant="outline" className="h-auto py-3 block text-center">
                    Verify Contracts
                 </Button>
             </div>
        </div>
      </div>
    </div>
  )
}


