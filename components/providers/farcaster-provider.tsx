import type { Context } from "@farcaster/miniapp-sdk";
import sdk from "@farcaster/miniapp-sdk";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode, createContext, useContext } from "react";

interface FrameContextValue {
  context: Context.MiniAppContext | undefined;
  isLoading: boolean;
  isSDKLoaded: boolean;
  isEthProviderAvailable: boolean;
  actions: typeof sdk.actions | undefined;
  haptics: typeof sdk.haptics | undefined;
  quickAuth: typeof sdk.quickAuth | undefined;
}

const FrameProviderContext = createContext<FrameContextValue | undefined>(
  undefined
);

export function useFrame() {
  const context = useContext(FrameProviderContext);
  if (context === undefined) {
    throw new Error("useFrame must be used within a FrameProvider");
  }
  return context;
}

interface FrameProviderProps {
  children: ReactNode;
}

export function FrameProvider({ children }: FrameProviderProps) {
  const farcasterContextQuery = useQuery({
    queryKey: ["farcaster-context"],
    queryFn: async () => {
      // Avoid getting stuck indefinitely waiting for SDK context/ready on slow webviews (eg. iOS).
      // Race context resolution against a short timeout so the UI can render a helpful fallback.
      const context = await Promise.race([
        sdk.context,
        new Promise<undefined>((resolve) =>
          setTimeout(() => resolve(undefined), 3000)
        ),
      ] as const);

      let isReady = false;
      if (context) {
        try {
          // Some hosts may stall on actions.ready(), race it against a timeout too.
          // actions.ready() resolves void on success — convert that to boolean true.
          isReady = await Promise.race([
            sdk.actions.ready().then(() => true),
            new Promise<boolean>((resolve) =>
              setTimeout(() => resolve(false), 3000)
            ),
          ] as const);
        } catch (err) {
          console.error("SDK initialization error:", err);
          isReady = false;
        }
      } else {
        // context was not available quickly — it may still resolve later; log for diagnostics.
        console.warn(
          "SDK context not available within timeout — running in fallback mode."
        );
      }

      return { context, isReady };
    },
  });

  const isReady = farcasterContextQuery.data?.isReady ?? false;

  return (
    <FrameProviderContext.Provider
      value={{
        context: farcasterContextQuery.data?.context,
        actions: sdk.actions,
        haptics: sdk.haptics,
        isLoading: farcasterContextQuery.isPending,
        isSDKLoaded: isReady && Boolean(farcasterContextQuery.data?.context),
        isEthProviderAvailable: Boolean(sdk.wallet.ethProvider),
        quickAuth: sdk.quickAuth,
      }}
    >
      {children}
    </FrameProviderContext.Provider>
  );
}
