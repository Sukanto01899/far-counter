"use client";

import { useFrame } from "@/components/providers/farcaster-provider";
import { SafeAreaContainer } from "@/components/providers/safe-area-container";
import LoadingPage from "./ui/LoadingPage";

export default function Home() {
  const { context, isLoading, isSDKLoaded } = useFrame();

  if (isLoading) {
    return (
      <SafeAreaContainer insets={context?.client.safeAreaInsets}>
        <LoadingPage />
      </SafeAreaContainer>
    );
  }

  if (!isSDKLoaded) {
    return (
      <SafeAreaContainer insets={context?.client.safeAreaInsets}>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-8">
          <h1 className="text-3xl font-bold text-center">
            No farcaster SDK found, please use this miniapp in the farcaster app
          </h1>
        </div>
      </SafeAreaContainer>
    );
  }

  // console.log(data);

  return (
    <SafeAreaContainer insets={context?.client.safeAreaInsets}>
      <div className="bg-slate-950  pb-20"></div>
    </SafeAreaContainer>
  );
}
