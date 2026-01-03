'use client'

import { AlertCircle, Brain, CheckCircle2, Loader, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface NobleScoreProps {
  presaleId?: string;
  // Fallback props for static display
  score?: number;
  metadata?: {
    githubVerified: boolean;
    whitepaperAnalyzed: boolean;
    liquidityLocked: boolean;
    reasoning?: string[];
  }
}

export function AIProjectScore({ presaleId, score: initialScore, metadata: initialMetadata }: NobleScoreProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(!!presaleId);

  useEffect(() => {
    if (presaleId) {
      const fetchScore = async () => {
        try {
          const res = await fetch(`/api/ai/score?id=${presaleId}`);
          const result = await res.json();
          setData(result);
        } catch (e) {
          console.error("AI Score Fetch failed", e);
        } finally {
          setLoading(false);
        }
      }
      fetchScore();
    }
  }, [presaleId]);

  const score = data?.score ?? initialScore ?? 0;
  const metadata = data?.analysis ?? initialMetadata ?? { githubVerified: false, whitepaperAnalyzed: false, liquidityLocked: false };
  const reasoning = data?.reasoning ?? initialMetadata?.reasoning ?? [];

  const getScoreColor = (s: number) => {
    if (s >= 8) return 'text-green-400 border-green-500/30 bg-green-500/5'
    if (s >= 5) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5'
    return 'text-red-400 border-red-500/30 bg-red-500/5'
  }

  if (loading) {
    return (
      <div className="noble-card flex flex-col items-center justify-center p-8 space-y-4">
        <Brain className="w-10 h-10 text-noble-gold animate-pulse" />
        <div className="flex items-center space-x-2 text-noble-gold/60 text-sm">
          <Loader className="w-4 h-4 animate-spin" />
          <span>Gemini AI is analyzing project metadata...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`noble-card border-2 p-6 rounded-2xl transition-all duration-500 ${getScoreColor(score)}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6" />
          <h3 className="text-xl font-bold uppercase tracking-wider">Noble AI Score</h3>
        </div>
        <div className="flex flex-col items-end">
            <div className="text-4xl font-black">{score}/10</div>
            <div className="text-[10px] uppercase font-bold tracking-widest opacity-60">
                {score >= 8 ? 'Safe Entry' : (score >= 5 ? 'Moderate Risk' : 'High Risk')}
            </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="opacity-60">GitHub Structure</span>
          <span className="font-bold">{metadata.githubVerified ? '✅ VERIFIED' : '❌ UNVERIFIED'}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="opacity-60">Whitepaper Scan</span>
          <span className="font-bold">{metadata.whitepaperAnalyzed ? '✅ SECURE' : '⚠️ WARNING'}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="opacity-60">Liquidity Safety</span>
          <span className="font-bold">{metadata.liquidityLocked ? '✅ DETECTED' : '❌ WEAK'}</span>
        </div>
      </div>

      {reasoning.length > 0 && (
        <div className="mb-6 space-y-2">
            <h4 className="text-[10px] uppercase font-bold text-white/40 flex items-center mb-2">
                <TrendingUp size={10} className="mr-1" /> Key Insights
            </h4>
            {reasoning.slice(0, 3).map((r: string, i: number) => (
                <div key={i} className="flex items-start space-x-2 text-xs leading-relaxed opacity-80">
                    <CheckCircle2 size={12} className="mt-0.5 flex-shrink-0" />
                    <span>{r}</span>
                </div>
            ))}
        </div>
      )}

      <div className="pt-4 border-t border-current/10 flex items-start space-x-2 opacity-50 italic text-[10px]">
        <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
        <span>Scored by NoblePad AI (Gemini 1.5 Flash). Dynamic risk engine updated real-time.</span>
      </div>
    </div>
  )
}
