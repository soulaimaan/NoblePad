'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, polygon, arbitrum, base, bsc } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { ReactNode } from 'react';

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [mainnet, bsc, polygon, arbitrum, base],
    transports: {
      // RPC URL for each chain
      [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/demo`),
      [bsc.id]: http(`https://bsc-dataseed.binance.org/`),
      [polygon.id]: http(`https://polygon-rpc.com/`),
      [arbitrum.id]: http(`https://arb1.arbitrum.io/rpc`),
      [base.id]: http(`https://mainnet.base.org/`),
    },

    // Required API Keys
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',

    // Required App Info
    appName: 'NoblePad - Anti-Rug Launchpad',

    // Optional App Info
    appDescription: 'Secure token creation and trading platform',
    appUrl: 'https://noblepad.com', // your app's url
    appIcon: 'https://noblepad.com/logo.png', // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
);

const queryClient = new QueryClient();

export function ConnectKitWagmiProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          theme="midnight"
          mode="light"
          customTheme={{
            '--ck-accent-color': '#00BB7F',
            '--ck-accent-text-color': '#ffffff',
            '--ck-border-radius': '10px',
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}