import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { TrendingUp, Award, CheckCircle, Star, Zap, Shield, ArrowRight } from 'lucide-react';

export default function StakingDashboard() {
  const tiers = [
    {
      name: 'Bronze',
      icon: Award,
      requirement: '10,000 $BELGRAVE',
      color: 'from-amber-700 to-amber-500',
      bgColor: 'bg-amber-900/20',
      borderColor: 'border-amber-600/30',
      benefits: [
        'Access to standard presales',
        'Basic allocation priority',
        'Community voting rights',
        'Platform updates & news'
      ]
    },
    {
      name: 'Silver',
      icon: Star,
      requirement: '50,000 $BELGRAVE',
      color: 'from-gray-400 to-gray-300',
      bgColor: 'bg-gray-800/20',
      borderColor: 'border-gray-600/30',
      benefits: [
        'Priority presale access',
        '2x allocation multiplier',
        'Early project previews',
        'Reduced platform fees (50% off)',
        'Exclusive community channel'
      ]
    },
    {
      name: 'Gold',
      icon: Zap,
      requirement: '100,000 $BELGRAVE',
      color: 'from-yellow-500 to-yellow-300',
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-600/30',
      benefits: [
        'Guaranteed allocations',
        '5x allocation multiplier',
        'Private deal access',
        'Zero platform fees',
        'Revenue share rewards',
        'Direct project communication',
        'VIP support channel'
      ]
    }
  ];

  const platformBenefits = [
    {
      icon: Shield,
      title: 'Security Funding',
      description: 'Staking fees fund AI infrastructure, smart contract audits, and emergency insurance pools'
    },
    {
      icon: TrendingUp,
      title: 'Buy-Back Mechanism',
      description: 'Platform revenue automatically buys back $BELGRAVE from the market, creating constant upward pressure'
    },
    {
      icon: Award,
      title: 'Governance Rights',
      description: 'Participate in platform decisions and vote on which projects get featured'
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-purple-900/30 border border-purple-600/50 rounded-full px-4 py-2 text-sm text-purple-300 mb-4">
            <TrendingUp className="w-4 h-4" />
            <span>Staking Program</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            The Belgrave Economy
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            $BELGRAVE is your Access Pass to the NoblePad ecosystem. Stake to unlock premium presales and exclusive benefits.
          </p>
        </div>

        {/* Golden Ticket Banner */}
        <Card className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-yellow-600/30 backdrop-blur-xl mb-12">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">The Golden Ticket</h2>
                <p className="text-gray-300 mb-4">
                  $BELGRAVE is not just a token — it is the mandatory Access Pass to the NoblePad ecosystem. 
                  Without staking $BELGRAVE, you cannot participate in high-demand presales.
                </p>
                <p className="text-gray-300">
                  This creates perpetual demand and ensures only serious investors access premium opportunities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tier Cards */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Staking Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier, index) => {
              const Icon = tier.icon;
              return (
                <Card key={index} className={`${tier.bgColor} border-2 ${tier.borderColor} backdrop-blur-xl hover:scale-105 transition-all duration-300`}>
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${tier.color} flex items-center justify-center mb-4 mx-auto`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-white text-center">{tier.name}</CardTitle>
                    <p className="text-center text-gray-400 text-sm mt-2">{tier.requirement}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {tier.benefits.map((benefit, bIndex) => (
                        <div key={bIndex} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Platform Benefits */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">The Engine</h2>
          <p className="text-lg text-gray-400 text-center mb-8 max-w-3xl mx-auto">
            Staking $BELGRAVE doesn't just grant access — it powers the entire platform
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {platformBenefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="bg-slate-900/50 border-purple-900/30 backdrop-blur-xl">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Multi-Chain Info */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Multi-Chain Future</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-600/30 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                    Ξ
                  </div>
                  Ethereum Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-gray-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">$2 trillion+ liquidity ecosystem</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">EVM compatibility (BSC, Polygon, Arbitrum, Base)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Institutional DeFi infrastructure</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Largest developer community</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-600/30 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    ✦
                  </div>
                  XRP Ledger
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-gray-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">3-5 second settlement times</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">$0.0001 average transaction cost</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Native DEX for instant liquidity</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Enterprise-grade reliability since 2012</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-none">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Staking?
            </h2>
            <p className="text-lg text-purple-100 mb-6 max-w-2xl mx-auto">
              Stake $BELGRAVE today and unlock access to the safest presales in DeFi
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="https://noblepad.netlify.app/staking" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-6 text-lg">
                  Stake Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
              <a href="https://xmagnetic.org/tokens/BELGRAVE+rMU2jwW88fdwSvRQmPr6CWJtg3xW31SuEG?network=mainnet" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
                  Trade $BELGRAVE
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}