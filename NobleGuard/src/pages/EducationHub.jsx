import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield, Lock, Eye, FileWarning, Users, CheckCircle, XCircle } from 'lucide-react';

export default function EducationHub() {
  const rugpullTypes = [
    {
      icon: Lock,
      title: 'Liquidity Pulls',
      description: 'Developers remove all liquidity from the DEX, making the token untradeable',
      warning: 'Most common type - happens when developers have direct access to liquidity pools',
      prevention: 'NoblePad automatically locks liquidity tokens. Developers never touch them.'
    },
    {
      icon: FileWarning,
      title: 'Mint Function Exploits',
      description: 'Hidden code allows unlimited token minting, diluting all holders',
      warning: 'Often hidden in complex smart contract code that looks legitimate',
      prevention: 'Gemini 3 Flash AI scans for hidden mint functions and rejects them instantly.'
    },
    {
      icon: Users,
      title: 'Team Dumps',
      description: 'Development team sells massive token allocations all at once',
      warning: 'Teams with no vesting can dump tokens immediately after launch',
      prevention: 'Hybrid vesting system prevents dumps and protects early investors.'
    },
    {
      icon: Eye,
      title: 'Honeypots',
      description: 'You can buy but cannot sell - code blocks all sell transactions',
      warning: 'Sneaky code that allows buys but prevents sells',
      prevention: 'AI auditor detects blacklist functions and sell restrictions before launch.'
    }
  ];

  const redFlags = [
    { flag: 'Anonymous team with no history', risk: 'Critical', icon: XCircle, color: 'text-red-400' },
    { flag: 'No locked liquidity', risk: 'Critical', icon: XCircle, color: 'text-red-400' },
    { flag: 'No audit from reputable firm', risk: 'High', icon: AlertTriangle, color: 'text-orange-400' },
    { flag: 'Unrealistic promises (1000x guaranteed)', risk: 'Critical', icon: XCircle, color: 'text-red-400' },
    { flag: 'No vesting for team tokens', risk: 'High', icon: AlertTriangle, color: 'text-orange-400' },
    { flag: 'Closed-source smart contracts', risk: 'High', icon: AlertTriangle, color: 'text-orange-400' },
    { flag: 'Pressure to invest quickly', risk: 'Critical', icon: XCircle, color: 'text-red-400' },
    { flag: 'No clear roadmap or utility', risk: 'Medium', icon: AlertTriangle, color: 'text-yellow-400' }
  ];

  const greenFlags = [
    { flag: 'Doxxed team with LinkedIn profiles', icon: CheckCircle, color: 'text-green-400' },
    { flag: 'Liquidity locked for 1+ years', icon: CheckCircle, color: 'text-green-400' },
    { flag: 'Multiple professional audits', icon: CheckCircle, color: 'text-green-400' },
    { flag: 'Team tokens vested over time', icon: CheckCircle, color: 'text-green-400' },
    { flag: 'Transparent tokenomics breakdown', icon: CheckCircle, color: 'text-green-400' },
    { flag: 'Active community with real discussions', icon: CheckCircle, color: 'text-green-400' },
    { flag: 'Clear utility and use case', icon: CheckCircle, color: 'text-green-400' },
    { flag: 'Regular development updates', icon: CheckCircle, color: 'text-green-400' }
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-purple-900/30 border border-purple-600/50 rounded-full px-4 py-2 text-sm text-purple-300 mb-4">
            <Shield className="w-4 h-4" />
            <span>Educational Content</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            DeFi Security Education Hub
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Learn how to identify rugpulls, understand security risks, and protect your investments
          </p>
        </div>

        {/* Rugpull Types */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Understanding Rugpull Types
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rugpullTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <Card key={index} className="bg-slate-900/50 border-purple-900/30 backdrop-blur-xl">
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-xl mb-2">{type.title}</CardTitle>
                        <p className="text-gray-400 text-sm">{type.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-red-300 text-sm">{type.warning}</p>
                      </div>
                    </div>
                    <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <Shield className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <p className="text-green-300 text-sm"><strong>NoblePad Protection:</strong> {type.prevention}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Red Flags */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            🚩 Red Flags to Watch For
          </h2>
          <Card className="bg-slate-900/50 border-red-900/30 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {redFlags.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-red-900/10 rounded-lg border border-red-600/20">
                      <Icon className={`w-5 h-5 ${item.color} flex-shrink-0`} />
                      <div className="flex-1">
                        <p className="text-white text-sm">{item.flag}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.risk === 'Critical' ? 'bg-red-600/20 text-red-300' :
                        item.risk === 'High' ? 'bg-orange-600/20 text-orange-300' :
                        'bg-yellow-600/20 text-yellow-300'
                      }`}>
                        {item.risk}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Green Flags */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            ✅ Green Flags for Safe Projects
          </h2>
          <Card className="bg-slate-900/50 border-green-900/30 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {greenFlags.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-green-900/10 rounded-lg border border-green-600/20">
                      <Icon className={`w-5 h-5 ${item.color} flex-shrink-0`} />
                      <p className="text-white text-sm">{item.flag}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* How NoblePad Prevents This */}
        <section>
          <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-600/30 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center space-x-3">
                <Shield className="w-8 h-8 text-purple-400" />
                <span>How NoblePad Eliminates These Risks</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">Automated Protection</h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Liquidity automatically locked in smart contract</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>AI scans all code for hidden backdoors</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Milestone-based fund release only</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Hard-coded automatic refund mechanism</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">Investor Control</h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Community votes on milestone completion</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Transparent allocation buckets visible on-chain</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Enforced vesting prevents team dumps</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Zero tolerance policy on failed audits</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="pt-4 border-t border-purple-600/30">
                <p className="text-gray-300 text-center">
                  <strong className="text-purple-400">Code is Law:</strong> All protections are hard-coded into immutable smart contracts. 
                  No human can override them, not even the NoblePad team.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}