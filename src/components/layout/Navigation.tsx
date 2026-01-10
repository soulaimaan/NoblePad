'use client'

import { Menu, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

const WalletButton = dynamic(
  () => import('@/components/ui/WalletConnection').then((mod) => mod.WalletButton),
  { ssr: false }
)

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigationItems = [
    { name: 'Home', href: '/' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Presales', href: '/presales' },
    { name: 'Liquidity Locks', href: '/locks' },
    { name: 'Token Locks', href: '/token-locks' },
    { name: 'Staking Hub', href: '/staking' },
    { name: 'Token Factory', href: '/create-token' },
    { name: 'Create Presale', href: '/create' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-noble-black/90 backdrop-blur-lg border-b border-noble-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 mr-4 shrink-0">
            <Image
              src="/logo.jpg"
              alt="Belgrave System Logo"
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
            />
            <span className="hidden lg:inline text-xl font-bold noble-text-gradient">Belgrave System</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 flex-1 justify-center">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-noble-gold/80 hover:text-noble-gold transition-colors duration-200 text-xs font-medium whitespace-nowrap"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side - Menu button first (mobile only), then wallet */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile menu button - comes BEFORE wallet so it's always visible */}
            <button
              className="md:hidden text-noble-gold p-2 -mr-1"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              title={isMenuOpen ? "Close mobile menu" : "Open mobile menu"}
              aria-label={isMenuOpen ? "Close mobile menu" : "Open mobile menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Wallet Connection */}
            <WalletButton />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          id="mobile-navigation"
          className={`md:hidden fixed left-0 right-0 top-16 z-40 transition-all duration-300 ease-in-out ${isMenuOpen
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}
        >
          <div className="mx-4 mt-2 bg-noble-gray/95 border border-noble-gold/20 rounded-xl shadow-2xl overflow-hidden"
            style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
            <div className="py-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-6 py-3 text-noble-gold/90 hover:text-noble-gold hover:bg-noble-gold/10 transition-colors duration-200 text-base font-medium border-b border-noble-gold/10 last:border-b-0"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
