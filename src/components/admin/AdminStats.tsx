'use client'

import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export function AdminStats() {
  // Mock data - would come from Supabase Edge Function
  const stats = [
    {
      title: 'Pending Review',
      value: 5,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10'
    },
    {
      title: 'Approved',
      value: 24,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      title: 'Rejected',
      value: 3,
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-400/10'
    },
    {
      title: 'Requires Action',
      value: 2,
      icon: AlertTriangle,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon
        return (
          <div key={index} className="noble-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-noble-gold/70 text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-noble-gold mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <IconComponent className={stat.color} size={24} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}