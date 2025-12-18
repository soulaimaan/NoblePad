'use client';

import {
    getDefaultConfig,
    RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import {
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from 'react';
import { WagmiProvider } from 'wagmi';
import {
    arbitrum,
    base,
    bsc,
    mainnet,
    optimism,
    polygon,
    sepolia,
} from 'wagmi/chains';

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default-project-id';

if (walletConnectProjectId === 'default-project-id' && typeof window !== 'undefined') {
  console.warn('⚠️ WALLETCONNECT PROJECT ID MISSING: Using default-project-id. WalletConnect features (like mobile connections) will NOT work on production domains. Please set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in your Netlify environment variables.');
}

const config = getDefaultConfig({
  appName: 'NoblePad - Anti-Rug Launchpad',
  projectId: walletConnectProjectId,
  chains: [mainnet, polygon, optimism, arbitrum, base, bsc, sepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

export const RainbowProvider = ({ children }: { children: React.ReactNode }) => {
  // Create a new QueryClient instance for each component mount
  // This prevents hydration errors in SSR environments like Netlify
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Prevent automatic refetching on the client
        staleTime: 60 * 1000,
      },
    },
  }));

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};