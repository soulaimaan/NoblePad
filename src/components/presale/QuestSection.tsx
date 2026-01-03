'use client'

import { Button } from '@/components/ui/Button'
import { useAccount } from '@/hooks/useCompatibleAccount'
import { CheckCircle, ExternalLink, Gift, Lock, MessageCircle, Twitter } from 'lucide-react'
import { useState } from 'react'

interface Quest {
  id: string
  title: string
  description: string
  reward: string
  icon: React.ReactNode
  link?: string
  status: 'locked' | 'available' | 'completed'
}

export function QuestSection({ presaleId }: { presaleId: string }) {
  const { isConnected } = useAccount()
  const [quests, setQuests] = useState<Quest[]>([
    {
      id: 'twitter',
      title: 'Follow on Twitter',
      description: 'Follow the official project account for updates.',
      reward: '+5% Allocation Chance',
      icon: <Twitter className="text-blue-400" size={20} />,
      link: 'https://twitter.com',
      status: 'available'
    },
    {
      id: 'telegram',
      title: 'Join Telegram Community',
      description: 'Join the discussion with other investors.',
      reward: 'Whitelist Access',
      icon: <MessageCircle className="text-blue-500" size={20} />,
      link: 'https://telegram.org',
      status: 'available'
    },
    {
      id: 'refer',
      title: 'Refer 3 Friends',
      description: 'Share your unique referral link.',
      reward: 'Early Access',
      icon: <Gift className="text-noble-gold" size={20} />,
      status: 'locked'
    }
  ])

  const handleVerify = (questId: string) => {
    // Simulate verification
    setQuests(prev => prev.map(q => {
      if (q.id === questId) {
        return { ...q, status: 'completed' }
      }
      if (q.id === 'refer' && questId !== 'refer') {
        // Unlock next quest for demo
        return { ...q, status: 'available' }
      }
      return q
    }))
  }

  if (!isConnected) {
    return (
        <div className="text-center py-12">
            <Lock className="w-12 h-12 text-noble-gold/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-noble-gold mb-2">Connect Wallet to View Quests</h3>
            <p className="text-sm text-noble-gold/70">
                Complete community quests to earn rewards and allocation boosts.
            </p>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h3 className="text-xl font-bold noble-text-gradient flex items-center gap-2">
             <Gift size={24} /> Community Quests
           </h3>
           <p className="text-sm text-noble-gold/70 mt-1">
             Complete tasks to unlock exclusive rewards and increase your allocation.
           </p>
        </div>
        <div className="text-right">
             <div className="text-2xl font-bold text-noble-gold">
               {quests.filter(q => q.status === 'completed').length}/{quests.length}
             </div>
             <div className="text-xs text-noble-gold/60">Completed</div>
        </div>
      </div>

      <div className="grid gap-4">
        {quests.map((quest) => (
          <div 
            key={quest.id}
            className={`noble-card p-4 flex items-center justify-between transition-all ${
                quest.status === 'completed' ? 'border-green-500/30 bg-green-500/5' : 
                quest.status === 'locked' ? 'opacity-50' : 'hover:border-noble-gold/40'
            }`}
          >
            <div className="flex items-center gap-4">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                   quest.status === 'completed' ? 'bg-green-500/20' : 'bg-noble-gray/50'
               }`}>
                  {quest.status === 'completed' ? <CheckCircle className="text-green-500" size={20} /> : quest.icon}
               </div>
               <div>
                  <h4 className="font-semibold text-noble-gold flex items-center gap-2">
                      {quest.title}
                  </h4>
                  <p className="text-sm text-noble-gold/60">{quest.description}</p>
                   {quest.status === 'completed' && (
                       <span className="text-xs text-green-400 font-medium mt-1 inline-block">
                           Reward Unlocked: {quest.reward}
                       </span>
                   )}
                   {quest.status !== 'completed' && (
                       <span className="text-xs text-noble-gold/40 mt-1 inline-block border border-noble-gold/20 px-2 py-0.5 rounded">
                           Reward: {quest.reward}
                       </span>
                   )}
               </div>
            </div>

            <div>
                {quest.status === 'available' && (
                    <div className="flex gap-2">
                        {quest.link && (
                            <a 
                                href={quest.link} 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-2 text-noble-gold/70 hover:text-noble-gold transition-colors"
                                aria-label={`Visit ${quest.title}`}
                            >
                                <ExternalLink size={18} />
                            </a>
                        )}
                        <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleVerify(quest.id)}
                        >
                            Verify
                        </Button>
                    </div>
                )}
                {quest.status === 'locked' && (
                    <Lock className="text-noble-gold/30 mr-2" size={18} />
                )}
                {quest.status === 'completed' && (
                    <div className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded-full">
                        Done
                    </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
