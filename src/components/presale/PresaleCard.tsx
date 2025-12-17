'use client'

import { Button } from '@/components/ui/Button'
import { Clock, Shield, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type PresaleStatus = 'live' | 'upcoming' | 'ended'

interface PresaleData {
  id: string
  name: string
  logo: string
  hardCap: string
  softCap: string
  raised: string
  progress: number
  endTime: Date
  status: PresaleStatus
  chain: string
  liquidityLock: string
}

interface PresaleCardProps {
  presale: PresaleData
}

export function PresaleCard({ presale }: PresaleCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeDiff = presale.endTime.getTime() - now.getTime()
      
      if (timeDiff <= 0) {
        setTimeLeft('Ended')
        return
      }
      
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      
      setTimeLeft(`${days}d ${hours}h`)
    }
    
    updateTime() // Initial call
    const interval = setInterval(updateTime, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [presale.endTime])

  const getStatusColor = (status: PresaleStatus) => {
    switch (status) {
      case 'live': return 'text-green-400'
      case 'upcoming': return 'text-yellow-400'
      case 'ended': return 'text-red-400'
      default: return 'text-noble-gold'
    }
  }

  const getStatusBadge = (status: PresaleStatus) => {
    switch (status) {
      case 'live': return 'bg-green-400/20 text-green-400'
      case 'upcoming': return 'bg-yellow-400/20 text-yellow-400'
      case 'ended': return 'bg-red-400/20 text-red-400'
      default: return 'bg-noble-gold/20 text-noble-gold'
    }
  }

  return (
    <div className="noble-card hover:shadow-xl hover:shadow-noble-gold/10 transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-noble-gold/10 rounded-lg flex items-center justify-center">
            <span className="text-noble-gold font-bold text-lg">
              {presale.name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-noble-gold">{presale.name}</h3>
            <span className="text-sm text-noble-gold/60">{presale.chain}</span>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusBadge(presale.status)}`}>
          {presale.status.toUpperCase()}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-noble-gold/70 mb-2">
          <span>Progress</span>
          <span>{presale.progress}%</span>
        </div>
        <div className="w-full bg-noble-gray rounded-full h-2">
          <div 
            className="bg-noble-gold-gradient h-2 rounded-full transition-all duration-500"
            style={{ width: `${presale.progress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-noble-gold/70 mt-2">
          <span>{presale.raised} raised</span>
          <span>{presale.hardCap} goal</span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp size={16} className="text-noble-gold/60" />
            <span className="text-sm text-noble-gold/70">Soft Cap</span>
          </div>
          <span className="text-sm text-noble-gold">{presale.softCap}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield size={16} className="text-noble-gold/60" />
            <span className="text-sm text-noble-gold/70">Liquidity Lock</span>
          </div>
          <span className="text-sm text-noble-gold">{presale.liquidityLock}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock size={16} className="text-noble-gold/60" />
            <span className="text-sm text-noble-gold/70">Time Left</span>
          </div>
          <span className={`text-sm font-medium ${getStatusColor(presale.status)}`}>
            {timeLeft}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <Link href={`/presale/${presale.id}`} className="block">
        <Button className="w-full group-hover:scale-105 transition-transform duration-200">
          {presale.status === 'live' ? 'Join Presale' : 'View Details'}
        </Button>
      </Link>
    </div>
  )
}