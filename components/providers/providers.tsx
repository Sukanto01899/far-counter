"use client";

import { FrameProvider } from "@/components/providers/farcaster-provider";
import { WalletProvider } from "@/components/providers/wallet-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <FrameProvider>{children}</FrameProvider>
    </WalletProvider>
  );
}
