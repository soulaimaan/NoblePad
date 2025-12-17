'use client';

import { ConnectKitButton } from 'connectkit';
import { useAccount } from 'wagmi';

export function WalletConnectButton() {
  const { address, isConnected } = useAccount();

  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
        return (
          <button
            onClick={show}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 border-noble-gold/20 bg-noble-gray text-noble-gold hover:bg-noble-gold/10"
          >
            {isConnected ? (
              <div className="flex items-center gap-2">
                <div className="text-sm">
                  <div className="font-medium">
                    {ensName ? ensName : `${address?.slice(0, 6)}...${address?.slice(-4)}`}
                  </div>
                  {chain && (
                    <div className="text-xs text-muted-foreground">
                      {chain.name}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            )}
          </button>
        );
      }}
    </ConnectKitButton.Custom>
  );
}

export function SimpleConnectButton() {
  return <ConnectKitButton />;
}