'use client'

import { Brain } from 'lucide-react'

interface AIScoreBadgeProps {
  score: number
  size?: 'sm' | 'md'
}

export function AIScoreBadge({ score, size = 'md' }: AIScoreBadgeProps) {
  const getScoreColor = (s: number) => {
    if (s >= 8) return 'text-green-400 border-green-500/30 bg-green-500/10'
    if (s >= 5) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
    return 'text-red-400 border-red-500/30 bg-red-500/10'
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
  const iconSize = size === 'sm' ? 10 : 12

  return (
    <div className={`inline-flex items-center gap-1.5 font-bold rounded-lg border ${padding} ${getScoreColor(score)}`}>
      <Brain size={iconSize} />
      <span>{score.toFixed(1)} AI Score</span>
    </div>
  )
}
