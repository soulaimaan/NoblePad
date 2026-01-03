import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Search, AlertTriangle, CheckCircle, XCircle, Info, Shield } from 'lucide-react';

export default function SafetyChecker() {
  const [address, setAddress] = useState('');
  const [showResults, setShowResults] = useState(false);

  const checkItems = [
    {
      category: 'Contract Code Analysis',
      checks: [
        { name: 'Hidden Mint Function', risk: 'critical', status: 'warning', description: 'Allows unlimited token creation' },
        { name: 'Blacklist Function', risk: 'high', status: 'warning', description: 'Can block addresses from selling' },
        { name: 'Ownership Renounced', risk: 'medium', status: 'check', description: 'Owner cannot modify contract' },
        { name: 'Proxy Pattern', risk: 'high', status: 'info', description: 'Contract can be upgraded by owner' }
      ]
    },
    {
      category: 'Liquidity Analysis',
      checks: [
        { name: 'Liquidity Locked', risk: 'critical', status: 'warning', description: 'DEX liquidity should be locked' },
        { name: 'Lock Duration', risk: 'high', status: 'check', description: 'Minimum 6 months recommended' },
        { name: 'LP Token Holder', risk: 'critical', status: 'warning', description: 'Who controls the liquidity' },
        { name: 'Liquidity %', risk: 'medium', status: 'check', description: 'Percentage of supply in liquidity' }
      ]
    },
    {
      category: 'Tokenomics & Distribution',
      checks: [
        { name: 'Team Allocation', risk: 'high', status: 'info', description: 'Team token percentage' },
        { name: 'Vesting Schedule', risk: 'high', status: 'warning', description: 'Are team tokens vested?' },
        { name: 'Max Transaction Limit', risk: 'medium', status: 'check', description: 'Prevents whale dumps' },
        { name: 'Tax Rate', risk: 'medium', status: 'check', description: 'Buy/sell tax percentage' }
      ]
    },
    {
      category: 'Security & Audits',
      checks: [
        { name: 'Professional Audit', risk: 'critical', status: 'warning', description: 'Third-party security audit' },
        { name: 'Audit Firm Reputation', risk: 'high', status: 'info', description: 'Known reputable auditor' },
        { name: 'Open Source Code', risk: 'medium', status: 'check', description: 'Code publicly verifiable' },
        { name: 'Bug Bounty Program', risk: 'low', status: 'check', description: 'Incentivized security testing' }
      ]
    }
  ];

  const handleCheck = (e) => {
    e.preventDefault();
    if (address.trim()) {
      setShowResults(true);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'check': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'danger': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-purple-900/30 border border-purple-600/50 rounded-full px-4 py-2 text-sm text-purple-300 mb-4">
            <Search className="w-4 h-4" />
            <span>Educational Tool</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Token Safety Checker
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Learn what security checks to perform before investing in any token
          </p>
        </div>

        {/* Disclaimer */}
        <Card className="bg-blue-900/20 border-blue-600/30 backdrop-blur-xl mb-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-300">
                <strong>Educational Tool:</strong> This is a demonstration of what security checks you should perform. 
                It shows you the types of risks to look for when evaluating any DeFi project. 
                Always do your own research and use multiple tools to verify token safety.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Form */}
        <Card className="bg-slate-900/50 border-purple-900/30 backdrop-blur-xl mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleCheck} className="flex flex-col md:flex-row gap-4">
              <Input
                type="text"
                placeholder="Enter token contract address (e.g., 0x123...)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="flex-1 bg-slate-800/50 border-purple-600/30 text-white placeholder:text-gray-500"
              />
              <Button 
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <Search className="w-4 h-4 mr-2" />
                Analyze Token
              </Button>
            </form>
          </CardContent>
        </Card>

        {showResults && (
          <>
            {/* Example Warning */}
            <Card className="bg-orange-900/20 border-orange-600/30 backdrop-blur-xl mb-8">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-orange-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Example Analysis Results</h3>
                    <p className="text-orange-300 text-sm mb-3">
                      Below is an example of the types of checks you should perform on any token contract. 
                      The items marked in orange or red are potential red flags that warrant further investigation.
                    </p>
                    <p className="text-orange-300 text-sm">
                      <strong>Real Analysis:</strong> Use tools like Etherscan, BSCScan, or professional audit services 
                      to perform these checks on actual contracts.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Check Results */}
            <div className="space-y-6">
              {checkItems.map((section, sectionIndex) => (
                <Card key={sectionIndex} className="bg-slate-900/50 border-purple-900/30 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white text-xl">{section.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {section.checks.map((check, checkIndex) => (
                        <div 
                          key={checkIndex} 
                          className="flex items-start justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50"
                        >
                          <div className="flex items-start space-x-3 flex-1">
                            {getStatusIcon(check.status)}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="text-white font-medium">{check.name}</h4>
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  check.risk === 'critical' ? 'bg-red-600/20 text-red-300' :
                                  check.risk === 'high' ? 'bg-orange-600/20 text-orange-300' :
                                  check.risk === 'medium' ? 'bg-yellow-600/20 text-yellow-300' :
                                  'bg-gray-600/20 text-gray-300'
                                }`}>
                                  {check.risk}
                                </span>
                              </div>
                              <p className="text-gray-400 text-sm">{check.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* NoblePad Advantage */}
            <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-600/30 backdrop-blur-xl mt-8">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center space-x-3">
                  <Shield className="w-8 h-8 text-purple-400" />
                  <span>How NoblePad Automates These Checks</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  Instead of manually checking all these security points, NoblePad's Gemini 3 Flash AI performs 
                  automated analysis on every project before launch:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-800/30 rounded-lg p-4 border border-green-600/30">
                    <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
                    <h4 className="text-white font-semibold mb-1">Automated Code Scanning</h4>
                    <p className="text-gray-400 text-sm">
                      AI scans for hidden mint functions, blacklists, and proxy patterns automatically
                    </p>
                  </div>
                  <div className="bg-slate-800/30 rounded-lg p-4 border border-green-600/30">
                    <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
                    <h4 className="text-white font-semibold mb-1">Enforced Liquidity Lock</h4>
                    <p className="text-gray-400 text-sm">
                      Liquidity is automatically locked by smart contract - no manual checks needed
                    </p>
                  </div>
                  <div className="bg-slate-800/30 rounded-lg p-4 border border-green-600/30">
                    <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
                    <h4 className="text-white font-semibold mb-1">Mandatory Vesting</h4>
                    <p className="text-gray-400 text-sm">
                      Team tokens are automatically vested - prevents immediate dumps
                    </p>
                  </div>
                  <div className="bg-slate-800/30 rounded-lg p-4 border border-green-600/30">
                    <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
                    <h4 className="text-white font-semibold mb-1">Zero Tolerance Policy</h4>
                    <p className="text-gray-400 text-sm">
                      Projects with security red flags cannot launch on the platform
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Learning Resources */}
        {!showResults && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="bg-slate-900/50 border-purple-900/30 backdrop-blur-xl">
              <CardContent className="p-6">
                <Search className="w-8 h-8 text-purple-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Where to Check</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Use blockchain explorers like Etherscan or BSCScan to view contract code and verify these security points.
                </p>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Etherscan.io (Ethereum)</li>
                  <li>• BSCScan.com (BSC)</li>
                  <li>• PolygonScan.com (Polygon)</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-purple-900/30 backdrop-blur-xl">
              <CardContent className="p-6">
                <Shield className="w-8 h-8 text-purple-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Audit Reports</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Look for audits from reputable firms. Common audit companies include:
                </p>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• CertiK</li>
                  <li>• Quantstamp</li>
                  <li>• OpenZeppelin</li>
                  <li>• ConsenSys Diligence</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-purple-900/30 backdrop-blur-xl">
              <CardContent className="p-6">
                <Info className="w-8 h-8 text-purple-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Community Tools</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Community-built tools can help identify potential scams:
                </p>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Token Sniffer</li>
                  <li>• Honeypot Detector</li>
                  <li>• RugDoc</li>
                  <li>• DeFi Safety</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}