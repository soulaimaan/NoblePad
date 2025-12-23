'use client'

import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Loader2, QrCode } from 'lucide-react'
import { useEffect, useState } from 'react'

interface XamanLoginModalProps {
  isOpen: boolean
  onClose: () => void
  qrUrl: string | null
  status: string
}

export function XamanLoginModal({ isOpen, onClose, qrUrl, status }: XamanLoginModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-noble-black border-noble-gold/20">
        <DialogHeader>
          <DialogTitle className="text-center text-noble-gold flex items-center justify-center gap-2">
            <QrCode className="w-5 h-5" />
            Connect Xaman Wallet
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          {qrUrl ? (
            <div className="bg-white p-4 rounded-xl shadow-2xl">
              <img 
                src={qrUrl} 
                alt="Xaman QR Code" 
                className="w-64 h-64"
              />
            </div>
          ) : (
            <div className="w-64 h-64 bg-black/40 rounded-xl flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-noble-gold animate-spin" />
            </div>
          )}

          <div className="text-center space-y-2">
            <p className="text-sm text-noble-gold/90 font-medium">
              Scan this QR code with your Xaman app
            </p>
            <p className="text-xs text-noble-gold/50 px-4">
              Status: <span className="text-noble-gold/80">{status}</span>
            </p>
          </div>

          <div className="pt-4 w-full">
             <Button 
                variant="outline" 
                className="w-full border-noble-gold/20 hover:bg-noble-gold/10 text-noble-gold"
                onClick={onClose}
             >
                Cancel
             </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
