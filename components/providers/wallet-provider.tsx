"use client";

import { Monad } from "@/lib/constants";
import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, WagmiProvider, createConfig } from "wagmi";
import {
  arbitrum,
  base,
  optimism,
  polygon,
  story,
  baseSepolia,
  celo,
} from "wagmi/chains";

export const config = createConfig({
  chains: [base, Monad, arbitrum, optimism, polygon, story, baseSepolia, celo],
  transports: {
    [base.id]: http(),
    [Monad.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [story.id]: http(),
    [baseSepolia.id]: http(),
    [celo.id]: http(),
  },
  connectors: [miniAppConnector()],
});

const queryClient = new QueryClient();

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
