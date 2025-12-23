'use client'

import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { ExternalLink, Loader2, QrCode, Smartphone } from 'lucide-react'
import { useEffect, useState } from 'react'

interface XamanLoginModalProps {
  isOpen: boolean
  onClose: () => void
  qrUrl: string | null
  deepLink: string | null
  status: string
}

export function XamanLoginModal({ isOpen, onClose, qrUrl, deepLink, status }: XamanLoginModalProps) {
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Detect mobile device
    if (typeof window !== 'undefined') {
      const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768
      setIsMobile(mobile)
    }
  }, [])

  if (!mounted) return null

  const isError = status.includes('Error') || status.includes('failed') || status.includes('authorized')

  const handleOpenInXaman = () => {
    if (deepLink) {
      window.open(deepLink, '_blank')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-noble-black border-noble-gold/20">
        <DialogHeader>
          <DialogTitle className="text-center text-noble-gold flex items-center justify-center gap-2">
            <QrCode className="w-5 h-5" />
            Connect Xaman Wallet
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-noble-gold/50">
            {isMobile 
              ? 'Tap the button below to open Xaman and sign in.'
              : 'Scan the QR code with your Xaman mobile app to sign in securely.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          {/* QR Code - show on all devices but smaller on mobile */}
          {!isError && qrUrl && (
            <div className={`bg-white p-3 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-300 ${isMobile ? 'w-40 h-40' : 'w-64 h-64'}`}>
              <img 
                src={qrUrl} 
                alt="Xaman QR Code" 
                className="w-full h-full"
              />
            </div>
          )}

          {/* Loading Spinner */}
          {!isError && !qrUrl && (
            <div className="w-64 h-64 bg-black/40 rounded-xl flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-noble-gold animate-spin" />
            </div>
          )}

          {/* Open in Xaman Button - always show when deepLink available */}
          {!isError && deepLink && (
            <Button 
              onClick={handleOpenInXaman}
              className="w-full bg-gradient-to-r from-noble-gold to-yellow-500 text-black font-semibold hover:from-yellow-500 hover:to-noble-gold"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Open in Xaman App
              <ExternalLink className="w-3 h-3 ml-2" />
            </Button>
          )}

          {/* Error Display */}
          {isError && (
             <div className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                <p className="font-bold mb-1">Connection Refused</p>
                <p className="text-xs opacity-80">{status}</p>
                <div className="mt-3 text-[10px] text-gray-500 border-t border-red-500/10 pt-2">
                    Tip: Ensure 'https://noblepad.netlify.app' is in your Xaman Developer Console.
                </div>
             </div>
          )}

          {/* Status Text */}
          <div className="text-center space-y-2">
            {!isError && !isMobile && (
                <p className="text-sm text-noble-gold/90 font-medium">
                  Scan the QR code or tap "Open in Xaman"
                </p>
            )}
            <p className="text-xs text-noble-gold/50 px-4">
              Status: <span className={isError ? 'text-red-400' : 'text-noble-gold/80'}>{status}</span>
            </p>
          </div>

          {/* Cancel Button */}
          <div className="pt-2 w-full">
             <Button 
                variant="outline" 
                className="w-full border-noble-gold/20 hover:bg-noble-gold/10 text-noble-gold"
                onClick={onClose}
             >
                {isError ? 'Try Again' : 'Cancel'}
             </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
