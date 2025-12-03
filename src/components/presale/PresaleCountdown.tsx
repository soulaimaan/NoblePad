'use client'

import { useState, useEffect } from 'react'
import { formatTimeLeft } from '@/lib/utils'
import { Clock } from 'lucide-react'

interface PresaleCountdownProps {
  endTime: Date
}

export function PresaleCountdown({ endTime }: PresaleCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(formatTimeLeft(endTime))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(formatTimeLeft(endTime))
    }, 1000)

    return () => clearInterval(interval)
  }, [endTime])

  if (timeLeft.expired) {
    return (
      <div className="noble-card text-center">
        <div className="flex items-center justify-center mb-4">
          <Clock className="text-red-400 mr-2" size={24} />
          <h3 className="text-xl font-semibold text-red-400">Presale Ended</h3>
        </div>
        <p className="text-noble-gold/70">This presale has concluded</p>
      </div>
    )
  }

  return (
    <div className="noble-card">
      <div className="flex items-center justify-center mb-4">
        <Clock className="text-noble-gold mr-2" size={20} />
        <h3 className="text-lg font-semibold text-noble-gold">Time Remaining</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-noble-gray/50 rounded-lg">
          <div className="text-2xl font-bold text-noble-gold">{timeLeft.days}</div>
          <div className="text-xs text-noble-gold/60 uppercase tracking-wide">Days</div>
        </div>
        <div className="p-3 bg-noble-gray/50 rounded-lg">
          <div className="text-2xl font-bold text-noble-gold">{timeLeft.hours}</div>
          <div className="text-xs text-noble-gold/60 uppercase tracking-wide">Hours</div>
        </div>
        <div className="p-3 bg-noble-gray/50 rounded-lg">
          <div className="text-2xl font-bold text-noble-gold">{timeLeft.minutes}</div>
          <div className="text-xs text-noble-gold/60 uppercase tracking-wide">Minutes</div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-noble-gold/70">
          Presale ends on {endTime.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  )
}