import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, AlertOctagon, Vote, Zap, RefreshCw, CheckCircle, ArrowRight } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Lock,
      title: 'Milestone-Based Escrow',
      subtitle: 'THE PROGRESSIVE UNLOCK',
      description: '100% of raised funds are locked in a Smart Vault. Developers only receive funds in stages (e.g., 20% Alpha, 30% Beta).',
      benefits: [
        'Investor Control: You vote on the release of the next stage',
        'If the work isn\'t done, the money stays in the vault',
        'Prevents developers from taking money and disappearing',
        'Milestone verification before each unlock'
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: AlertOctagon,
      title: 'Hard-Coded Kill-Switch',
      subtitle: 'ABANDONMENT PROTECTION',
      description: 'If no activity is detected on-chain for 6 months, the contract enters "Emergency Mode".',
      benefits: [
        'Automatic Refunds: "Claim Refund" button is enabled for all investors',
        'No human intervention needed',
        'Code is Law - cannot be overridden',
        'Protects against abandoned projects'
      ],
      color: 'from-red-500 to-orange-500'
    },
    {
      icon: Zap,
      title: 'AI-Driven Risk Elimination',
      subtitle: 'GEMINI 3 FLASH AUDITOR',
      description: 'Our AI acts as a relentless Digital Auditor, scanning for hidden "mint", "blacklist", or "proxy" backdoors.',
      benefits: [
        'Zero Tolerance: Projects cannot launch without passing Noble Score',
        'Bad code is rejected instantly',
        'Scans for honeypot patterns',
        'Detects hidden admin functions'
      ],
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Shield,
      title: 'Liquidity Lock-In',
      subtitle: 'IMMUTABLE MARKETS',
      description: 'DEX liquidity (Uniswap/Magnetic) is automatically locked by the NoblePad contract upon listing.',
      benefits: [
        'Hands-Off: Developer never touches the liquidity tokens',
        'Rug-pulls via liquidity removal are technically impossible',
        'Time-locked for minimum 6 months',
        'Transparent on-chain verification'
      ],
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Vote,
      title: 'Community Governance',
      subtitle: 'INVESTOR DEMOCRACY',
      description: 'Token holders vote on critical project decisions and milestone completions.',
      benefits: [
        'Democratic decision-making process',
        'Prevents unilateral project changes',
        'Community-driven development',
        'Transparent voting on-chain'
      ],
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: RefreshCw,
      title: 'Hybrid Vesting System',
      subtitle: 'DUMP PREVENTION',
      description: 'Team tokens are locked and released gradually over time based on project milestones.',
      benefits: [
        'Prevents immediate team dumps',
        'Aligns team incentives with long-term success',
        'Protects early investors',
        'Creates sustainable tokenomics'
      ],
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const comparisonData = [
    {
      feature: 'Liquidity Lock',
      traditional: 'Optional, often unlocked',
      noblepad: 'Automatic & Immutable'
    },
    {
      feature: 'Fund Release',
      traditional: '100% upfront to developers',
      noblepad: 'Milestone-based escrow'
    },
    {
      feature: 'Smart Contract Audit',
      traditional: 'Optional or self-audited',
      noblepad: 'AI-powered mandatory audit'
    },
    {
      feature: 'Team Vesting',
      traditional: 'Often no vesting',
      noblepad: 'Enforced hybrid vesting'
    },
    {
      feature: 'Abandoned Project Protection',
      traditional: 'None',
      noblepad: 'Auto-refund kill-switch'
    },
    {
      feature: 'Investor Control',
      traditional: 'Minimal to none',
      noblepad: 'Vote on milestones'
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-purple-900/30 border border-purple-600/50 rounded-full px-4 py-2 text-sm text-purple-300 mb-4">
            <Shield className="w-4 h-4" />
            <span>Security Architecture</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Anti-Rugpull Security Features
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Institutional-grade protection powered by immutable smart contracts and AI-driven auditing
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="bg-slate-900/50 border-purple-900/30 backdrop-blur-xl hover:border-purple-600/50 transition-all duration-300">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs text-purple-400 font-semibold mb-1">{feature.subtitle}</div>
                  <CardTitle className="text-white text-2xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-400">{feature.description}</p>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, bIndex) => (
                      <div key={bIndex} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Comparison Table */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Traditional Launchpads vs NoblePad
          </h2>
          <Card className="bg-slate-900/50 border-purple-900/30 backdrop-blur-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-900/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">Feature</th>
                    <th className="px-6 py-4 text-left text-red-400 font-semibold">Traditional Launchpads</th>
                    <th className="px-6 py-4 text-left text-green-400 font-semibold">NoblePad</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr key={index} className="border-t border-purple-900/20">
                      <td className="px-6 py-4 text-white font-medium">{row.feature}</td>
                      <td className="px-6 py-4 text-gray-400">{row.traditional}</td>
                      <td className="px-6 py-4 text-green-400 font-medium">{row.noblepad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            How It Works: Step by Step
          </h2>
          <div className="space-y-4">
            {[
              {
                step: '1',
                title: 'Project Submission',
                description: 'Developer submits project for review. Smart contract code is uploaded for analysis.'
              },
              {
                step: '2',
                title: 'AI Security Audit',
                description: 'Gemini 3 Flash AI scans for vulnerabilities, backdoors, and malicious patterns. Projects must pass to continue.'
              },
              {
                step: '3',
                title: 'Presale Launch',
                description: 'Approved projects launch presale. All funds are locked in milestone-based escrow smart contract.'
              },
              {
                step: '4',
                title: 'Automatic Liquidity Lock',
                description: 'Upon listing, DEX liquidity is automatically locked by NoblePad contract. Developer never touches it.'
              },
              {
                step: '5',
                title: 'Milestone Voting',
                description: 'Community votes on milestone completion. Funds are released only after approval.'
              },
              {
                step: '6',
                title: 'Kill-Switch Protection',
                description: 'If abandoned, investors can claim automatic refunds after 6 months of inactivity.'
              }
            ].map((item, index) => (
              <Card key={index} className="bg-slate-900/50 border-purple-900/30 backdrop-blur-xl">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                      <p className="text-gray-400">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-none">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Experience Security-First Investing
            </h2>
            <p className="text-lg text-purple-100 mb-6 max-w-2xl mx-auto">
              Join the revolution. Stake $BELGRAVE and gain access to the safest presales in DeFi.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="https://noblepad.netlify.app/staking" target="_blank" rel="noopener noreferrer">
                <button className="px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2">
                  <span>Start Staking</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </a>
              <a href="https://noblepad-security-whitepaper.netlify.app/" target="_blank" rel="noopener noreferrer">
                <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                  Read Whitepaper
                </button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}