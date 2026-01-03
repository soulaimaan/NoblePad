'use client'

import { Flame, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface TrendingProject {
  id: string
  name: string
  symbol: string
  change24h: number
  isHot: boolean
}

// Mock data for trending projects
const MOCK_TRENDING: TrendingProject[] = [
  { id: '1', name: 'NoblePad', symbol: 'NPAD', change24h: 12.5, isHot: true },
  { id: '2', name: 'SafeMoon 3.0', symbol: 'SFM3', change24h: 5.2, isHot: true },
  { id: '3', name: 'Pepe AI', symbol: 'PEPEAI', change24h: 24.8, isHot: true },
  { id: '4', name: 'Belgrave', symbol: 'BLGRV', change24h: 8.9, isHot: false },
  { id: '5', name: 'DogeVerse', symbol: 'DOGEV', change24h: -2.1, isHot: false },
]

export function TrendingBar() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="w-full bg-noble-black border-b border-noble-gold/10 overflow-hidden relative h-10 flex items-center">
      <div className="flex items-center absolute left-0 z-10 bg-noble-black pr-4 pl-4 h-full border-r border-noble-gold/10 shadow-lg shadow-black/50">
        <Flame className="text-orange-500 mr-2 animate-pulse" size={16} />
        <span className="text-xs font-bold text-noble-gold uppercase tracking-wider">Trending</span>
      </div>
      
      {/* Marquee Effect */}
      <div className="flex items-center space-x-8 animate-marquee whitespace-nowrap pl-32">
        {[...MOCK_TRENDING, ...MOCK_TRENDING].map((project, i) => (
          <Link 
            key={`${project.id}-${i}`} 
            href={`/presale/${project.id}`}
            className="flex items-center space-x-2 group hover:opacity-100 opacity-70 transition-opacity"
          >
            <span className="text-xs font-bold text-white group-hover:text-noble-gold">#{i + 1} {project.name}</span>
            <span className={`text-[10px] ${project.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {project.change24h > 0 ? '+' : ''}{project.change24h}%
            </span>
            {project.isHot && <TrendingUp size={12} className="text-green-500" />}
          </Link>
        ))}
      </div>
    </div>
  )
}
