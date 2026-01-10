'use client';

import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react'

export function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit()

  return (
    <button
      onClick={() => open()}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 border-noble-gold/20 bg-noble-gray text-noble-gold hover:bg-noble-gold/10"
    >
      {isConnected ? (
        <div className="flex items-center gap-2">
          <div className="text-sm">
            <div className="font-medium">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
          </div>
        </div>
      ) : (
        <span>Connect Wallet</span>
      )}
    </button>
  );
}

export function SimpleConnectButton() {
  const { open } = useAppKit()
  return (
    <button
      onClick={() => open()}
      className="noble-button-outline px-4 py-2 rounded-lg"
    >
      Connect Wallet
    </button>
  );
}