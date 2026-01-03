import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils/utils.js';
import { Shield, Lock, AlertTriangle, Award, BookOpen, Search, MessageSquare, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';

export default function Home() {
  const features = [
    {
      icon: BookOpen,
      title: 'Education Hub',
      description: 'Learn how to identify rugpulls and protect your investments',
      link: 'EducationHub',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Search,
      title: 'Safety Checker',
      description: 'Educational tool to understand token security red flags',
      link: 'SafetyChecker',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Shield,
      title: 'Security Features',
      description: 'Explore NoblePad\'s institutional-grade protection',
      link: 'Features',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: MessageSquare,
      title: 'Community Forum',
      description: 'Join discussions about DeFi security and best practices',
      link: 'Forum',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const stats = [
    { label: 'Security Layers', value: '4+', icon: Lock },
    { label: 'Rugpull Prevention', value: '100%', icon: Shield },
    { label: 'AI Scanning', value: 'Real-time', icon: AlertTriangle },
    { label: 'Community Trust', value: 'Maximum', icon: Award }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center space-x-2 bg-purple-900/30 border border-purple-600/50 rounded-full px-4 py-2 text-sm text-purple-300">
              <Shield className="w-4 h-4" />
              <span>Security-First DeFi Launchpad</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              The Future of
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Safe DeFi Launches
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Institutional-grade security meets revolutionary code. NoblePad eliminates rug pulls with AI-powered vetting, 
              milestone escrow, and guaranteed investor protection.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a
                href="https://noblepad.netlify.app/staking"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg flex items-center space-x-2">
                  <span>Stake</span>
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695254e825f5fd878e3659c3/e70326692_logobelgrave.png" 
                    alt="BELGRAVE" 
                    className="w-6 h-6 object-contain"
                  />
                  <span>$BELGRAVE</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
              <Link to={createPageUrl('EducationHub')}>
                <Button size="lg" variant="outline" className="border-purple-600 text-purple-400 hover:bg-purple-900/30 px-8 py-6 text-lg">
                  Start Learning
                  <BookOpen className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-slate-900/50 border-purple-900/30 backdrop-blur-xl">
                <CardContent className="p-6 text-center">
                  <Icon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Your Complete Security Toolkit
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Everything you need to navigate DeFi safely and confidently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link key={index} to={createPageUrl(feature.link)}>
                <Card className="bg-slate-900/50 border-purple-900/30 backdrop-blur-xl hover:border-purple-600/50 transition-all duration-300 hover:scale-105 cursor-pointer h-full">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">{feature.description}</p>
                    <div className="flex items-center text-purple-400 mt-4 text-sm font-medium">
                      Explore <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Why NoblePad Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-900/30 rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Why NoblePad?
              </h2>
              <p className="text-gray-300 mb-8 leading-relaxed">
                Traditional launchpads prioritize speed over security, resulting in billions lost to rug pulls and exit scams. 
                We've inverted this model entirely with code-enforced safety.
              </p>
              <div className="space-y-4">
                {[
                  'Milestone-Based Escrow Protection',
                  'AI-Driven Risk Elimination',
                  'Immutable Liquidity Lock-In',
                  'Automatic Refund Mechanisms'
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Card className="bg-slate-900/50 border-purple-900/30 backdrop-blur-xl">
                <CardContent className="p-6">
                  <Lock className="w-8 h-8 text-purple-400 mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">Hard-Coded Kill-Switch</h3>
                  <p className="text-gray-400 text-sm">
                    If no activity for 6 months, automatic refunds are enabled. No human intervention needed. Code is Law.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/50 border-purple-900/30 backdrop-blur-xl">
                <CardContent className="p-6">
                  <AlertTriangle className="w-8 h-8 text-purple-400 mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">Gemini 3 Flash Auditor</h3>
                  <p className="text-gray-400 text-sm">
                    AI scans for hidden backdoors, mint functions, and blacklist risks. Bad code is rejected instantly.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Join the Revolution?
          </h2>
          <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
            Stake <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695254e825f5fd878e3659c3/e70326692_logobelgrave.png" alt="BELGRAVE" className="w-5 h-5 object-contain inline-block mx-1" />$BELGRAVE today and gain access to the safest presales in DeFi.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="https://noblepad.netlify.app/staking" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-6 text-lg flex items-center space-x-2">
                <span>Start Staking</span>
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695254e825f5fd878e3659c3/e70326692_logobelgrave.png" 
                  alt="BELGRAVE" 
                  className="w-6 h-6 object-contain"
                />
                <TrendingUp className="w-5 h-5 ml-2" />
              </Button>
            </a>
            <Link to={createPageUrl('StakingDashboard')}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
                View Tiers
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}