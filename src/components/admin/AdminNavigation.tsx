'use client'

import { Button } from '@/components/ui/Button'

interface AdminNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AdminNavigation({ activeTab, onTabChange }: AdminNavigationProps) {
  const tabs = [
    { id: 'pending', label: 'Pending Review', count: 5 },
    { id: 'approved', label: 'Approved', count: 24 },
    { id: 'rejected', label: 'Rejected', count: 3 },
    { id: 'live', label: 'Live Presales', count: 8 },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? 'default' : 'outline'}
          onClick={() => onTabChange(tab.id)}
          className="relative"
        >
          {tab.label}
          {tab.count > 0 && (
            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
              activeTab === tab.id 
                ? 'bg-noble-black text-noble-gold' 
                : 'bg-noble-gold/20 text-noble-gold'
            }`}>
              {tab.count}
            </span>
          )}
        </Button>
      ))}
    </div>
  )
}