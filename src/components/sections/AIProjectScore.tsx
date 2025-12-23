'use client'

import { AlertCircle, Brain } from 'lucide-react';

interface NobleScoreProps {
  score: number; // 1-10
  metadata: {
    githubVerified: boolean;
    whitepaperAnalyzed: boolean;
    liquidityLocked: boolean;
  }
}

export function AIProjectScore({ score, metadata }: NobleScoreProps) {
  const getScoreColor = (s: number) => {
    if (s >= 8) return 'text-green-400 border-green-500/50 bg-green-500/10'
    if (s >= 5) return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10'
    return 'text-red-400 border-red-500/50 bg-red-500/10'
  }

  return (
    <div className={`noble-card border-2 p-6 rounded-2xl ${getScoreColor(score)}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6" />
          <h3 className="text-xl font-bold uppercase tracking-wider">Noble AI Score</h3>
        </div>
        <div className="text-4xl font-black">{score}/10</div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm opacity-80">
          <span>GitHub Structure Analysis</span>
          <span>{metadata.githubVerified ? '✅ VERIFIED' : '❌ UNVERIFIED'}</span>
        </div>
        <div className="flex items-center justify-between text-sm opacity-80">
          <span>Whitepaper Deep-Scan</span>
          <span>{metadata.whitepaperAnalyzed ? '✅ SECURE' : '⚠️ WARNING'}</span>
        </div>
        <div className="flex items-center justify-between text-sm opacity-80">
          <span>Hardcoded Liquidity Check</span>
          <span>{metadata.liquidityLocked ? '✅ DETECTED' : '❌ MISSING'}</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-current/20 flex items-start space-x-2 opacity-70 italic text-xs">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>Scored by Gemini 3 Flash. This is an automated assessment based on provided metadata.</span>
      </div>
    </div>
  )
}
