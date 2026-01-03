import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils/utils.js';
import { Menu, X, Shield, BookOpen, Search, Layout as LayoutIcon, MessageSquare, TrendingUp, Home } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', path: 'Home', icon: Home },
    { name: 'Education Hub', path: 'EducationHub', icon: BookOpen },
    { name: 'Safety Checker', path: 'SafetyChecker', icon: Search },
    { name: 'Features', path: 'Features', icon: Shield },
    { name: 'Resources', path: 'Resources', icon: LayoutIcon },
    { name: 'Community', path: 'Forum', icon: MessageSquare },
    { name: 'Staking', path: 'StakingDashboard', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <header className="border-b border-purple-900/20 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to={createPageUrl('Home')} className="flex items-center space-x-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695254e825f5fd878e3659c3/4e56bc36c_alleenlogo.PNG" 
                alt="NoblePad Logo" 
                className="w-10 h-10 object-contain"
              />
              <div>
                <div className="text-xl font-bold text-white">NoblePad</div>
                <div className="text-xs text-purple-400">Security-First Launchpad</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.path;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.path)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                      isActive
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-300 hover:bg-purple-900/30 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* External Links */}
            <div className="hidden md:flex items-center space-x-3">
              <a
                href="https://noblepad.netlify.app/staking"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center space-x-2"
              >
                <span>Stake</span>
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695254e825f5fd878e3659c3/e70326692_logobelgrave.png" 
                  alt="BELGRAVE" 
                  className="w-5 h-5 object-contain"
                />
                <span>$BELGRAVE</span>
              </a>
              <a
                href="https://noblepad-security-whitepaper.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-purple-600 text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-900/30 transition-all"
              >
                Whitepaper
              </a>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-purple-900/20 bg-slate-950/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.path;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.path)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-300 hover:bg-purple-900/30 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <div className="pt-4 space-y-2">
                <a
                  href="https://noblepad.netlify.app/staking"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium text-center flex items-center justify-center space-x-2"
                >
                  <span>Stake</span>
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695254e825f5fd878e3659c3/e70326692_logobelgrave.png" 
                    alt="BELGRAVE" 
                    className="w-5 h-5 object-contain"
                  />
                  <span>$BELGRAVE</span>
                </a>
                <a
                  href="https://noblepad-security-whitepaper.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2 border border-purple-600 text-purple-400 rounded-lg text-sm font-medium text-center"
                >
                  Whitepaper
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-purple-900/20 bg-slate-950/50 backdrop-blur-xl mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695254e825f5fd878e3659c3/4e56bc36c_alleenlogo.PNG" 
                  alt="NoblePad Logo" 
                  className="w-10 h-10 object-contain"
                />
                <div className="text-xl font-bold text-white">NoblePad</div>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                The world's first Security-First DeFi Launchpad. Institutional-grade security meets revolutionary code architecture.
              </p>
              <div className="text-xs text-gray-500">
                © 2024 NoblePad. Built for the community.
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="https://noblepad.netlify.app/" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">Launch App</a></li>
                <li><a href="https://noblepad.netlify.app/staking" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">Staking</a></li>
                <li><a href="https://noblepad-security-whitepaper.netlify.app/" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">Whitepaper</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="https://lordbelgrave.eu/" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">$BELGRAVE</a></li>
                <li><a href="https://zealy.io/cw/lordbelgrave/" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">Join Council</a></li>
                <li><a href="https://xmagnetic.org/tokens/BELGRAVE+rMU2jwW88fdwSvRQmPr6CWJtg3xW31SuEG?network=mainnet" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">Trade</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}