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

const config = getDefaultConfig({
  appName: 'NoblePad - Anti-Rug Launchpad',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default-project-id',
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