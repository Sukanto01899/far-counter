"use client";

import { Button } from "@/components/common/Button";
import { useFrame } from "@/components/providers/farcaster-provider";
import { counterAbi } from "@/lib/abi";
import {
  COUNTER_CHAIN_ID,
  COUNTER_CONTRACT,
  DEFAULT_REWARD_WEI,
  INCREMENT_API_PATH,
  REWARD_DECIMALS,
  REWARD_SYMBOL,
} from "@/lib/counter-config";
import { useEffect, useMemo, useState } from "react";
import { formatUnits } from "viem";
import {
  useAccount,
  useChainId,
  useConnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

const contractAddress = COUNTER_CONTRACT;

const formatCooldown = (seconds: number) => {
  if (seconds <= 0) return "Ready now";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const parts: string[] = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  return parts.join(" ");
};

export default function Page() {
  const { context, haptics } = useFrame();
  const fid = context?.user?.fid;

  const { address, isConnected } = useAccount();
  const { connectAsync, connectors, isPending: isConnecting } = useConnect();
  const { switchChainAsync } = useSwitchChain();
  const activeChainId = useChainId();

  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [lastSignatureReward, setLastSignatureReward] =
    useState<bigint>(DEFAULT_REWARD_WEI);

  const totalQuery = useReadContract({
    abi: counterAbi,
    address: contractAddress,
    functionName: "totalIncrements",
    chainId: COUNTER_CHAIN_ID,
    query: { enabled: Boolean(contractAddress) },
  });

  const userQuery = useReadContract({
    abi: counterAbi,
    address: contractAddress,
    functionName: "getUserData",
    args: fid ? [BigInt(fid)] : undefined,
    chainId: COUNTER_CHAIN_ID,
    query: { enabled: Boolean(contractAddress && fid) },
  });

  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
      chainId: COUNTER_CHAIN_ID,
    });

  const totalIncrements = (totalQuery.data as bigint | undefined) ?? BigInt(0);
  const userData = userQuery.data as [bigint, bigint] | undefined;
  const userTotal = userData?.[0] ?? BigInt(0);
  const availableAt = userData?.[1] ?? BigInt(0);

  const COOLDOWN_SECONDS = 6 * 60 * 60;

  const cooldownSeconds = useMemo(() => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const availableSeconds = Number(availableAt);
    if (!availableSeconds) return 0;
    return Math.max(0, availableSeconds - nowSeconds);
  }, [availableAt]);

  const cooldownProgress = useMemo(() => {
    if (!availableAt || cooldownSeconds <= 0) return 1;
    return Math.max(0, Math.min(1, 1 - cooldownSeconds / COOLDOWN_SECONDS));
  }, [availableAt, cooldownSeconds, COOLDOWN_SECONDS]);

  const rewardDisplay = useMemo(
    () => formatUnits(lastSignatureReward, REWARD_DECIMALS),
    [lastSignatureReward]
  );

  useEffect(() => {
    if (isConfirmed) {
      totalQuery.refetch?.();
      userQuery.refetch?.();
      setStatus("Increment confirmed onchain");
      haptics?.notificationOccurred?.("success");
    }
  }, [isConfirmed, totalQuery, userQuery, haptics]);

  const handleIncrement = async () => {
    setError(null);
    setStatus(null);

    if (!contractAddress) {
      setError("Set NEXT_PUBLIC_COUNTER_CONTRACT to your deployed contract.");
      return;
    }

    if (!fid) {
      setError("Farcaster fid missing from SDK context.");
      return;
    }

    try {
      let userAddress = address;

      if (!isConnected) {
        const connector = connectors[0];
        if (!connector) {
          setError("No wallet connector available in this miniapp.");
          return;
        }
        setStatus("Connecting wallet...");
        const res = await connectAsync({
          connector,
          chainId: COUNTER_CHAIN_ID,
        });
        userAddress = res.accounts[0];
      }

      if (!userAddress) {
        setError("Wallet address unavailable.");
        return;
      }

      if (activeChainId !== COUNTER_CHAIN_ID) {
        setStatus("Switching to Base...");
        await switchChainAsync({ chainId: COUNTER_CHAIN_ID });
      }

      setStatus("Fetching server signature...");
      const signatureRes = await fetch(INCREMENT_API_PATH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-fid": fid.toString(),
        },
        body: JSON.stringify({
          userAddress,
          contract: contractAddress,
        }),
        cache: "no-store",
      });

      const signatureJson = await signatureRes.json();
      if (!signatureRes.ok || !signatureJson.signature) {
        throw new Error(signatureJson.error || "Failed to fetch signature");
      }

      const requestStruct = {
        user: userAddress as `0x${string}`,
        fid: BigInt(fid),
        nonce: BigInt(signatureJson.nonce),
        deadline: BigInt(signatureJson.deadline),
        reward: BigInt(signatureJson.reward),
      };

      setLastSignatureReward(requestStruct.reward);

      setStatus("Sending transaction...");
      const hash = await writeContractAsync({
        abi: counterAbi,
        address: contractAddress,
        functionName: "increment",
        args: [requestStruct, signatureJson.signature as `0x${string}`],
        chainId: COUNTER_CHAIN_ID,
      });

      setTxHash(hash);
      setStatus("Waiting for confirmation...");
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Failed to submit increment";
      setError(message);
      setStatus(null);
    }
  };

  const isProcessing =
    isConnecting ||
    isWriting ||
    isConfirming ||
    status === "Waiting for confirmation...";

  const disableIncrement =
    cooldownSeconds > 0 || !contractAddress || !fid || isProcessing;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0c1229] via-[#0b0f1f] to-[#070911] text-white px-3 py-6 sm:py-8">
      <div className="pointer-events-none absolute -left-10 -top-10 h-52 w-52 rounded-full bg-blue-600/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-20 h-44 w-44 rounded-full bg-purple-600/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-40 w-64 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(80,120,255,0.12),transparent_35%)]" />

      <div className="relative mx-auto flex max-w-screen-sm flex-col gap-4 sm:gap-5">
        <div className="rounded-2xl border border-blue-500/30 bg-white/5 p-4 sm:p-4 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">
                Far Arcade
              </h1>
              <p className="text-sm text-slate-200/80 leading-relaxed">
                Tap to level up your fid, snag tokens, and flex your onchain
                streak.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 shadow-inner shadow-blue-900/40">
              <p className="text-xs uppercase tracking-wide text-slate-300/70">
                Global taps
              </p>
              <p className="mt-1 text-3xl font-black drop-shadow-sm">
                {totalIncrements.toString()}
              </p>
              <p className="text-[11px] text-slate-400">Total adventurers</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 shadow-inner shadow-blue-900/40">
              <p className="text-xs uppercase tracking-wide text-slate-300/70">
                Your taps
              </p>
              <p className="mt-1 text-3xl font-black text-emerald-200 drop-shadow-sm">
                {userTotal.toString()}
              </p>
              <p className="text-[11px] text-slate-400">
                Fid {fid ?? "?"} progress
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/5 bg-slate-900/50 p-4 shadow-inner shadow-blue-900/30">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-300/70">
                  Cooldown bar
                </p>
                <p className="text-lg font-semibold">
                  {formatCooldown(cooldownSeconds)}
                </p>
              </div>
              {txHash ? (
                <a
                  className="text-xs text-blue-200 underline"
                  href={`https://basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View last tx
                </a>
              ) : (
                <span className="text-xs text-slate-400">No tx yet</span>
              )}
            </div>
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-300 transition-all"
                style={{ width: `${Math.round(cooldownProgress * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              {cooldownSeconds > 0
                ? "Refuel in progress - grab a snack!"
                : "Ready to smash the Increment button."}
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <Button
              onClick={handleIncrement}
              isLoading={isProcessing}
              disabled={disableIncrement}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 py-3.5 text-base font-extrabold shadow-lg shadow-blue-700/40 transition hover:scale-[1.02] hover:shadow-blue-400/50 hover:brightness-110 disabled:scale-100 disabled:opacity-60"
            >
              {cooldownSeconds > 0
                ? "Cooldown active"
                : isProcessing
                ? "Casting spell..."
                : "Tap to Power Up"}
            </Button>
            {!isConnected && (
              <p className="text-xs text-center text-slate-300/80">
                We will auto-connect your Base miniapp wallet. No extra clicks.
              </p>
            )}
            {status && (
              <div className="rounded-xl bg-blue-500/15 px-3 py-2 text-xs text-blue-100">
                {status}
              </div>
            )}
            {error && (
              <div className="rounded-xl bg-red-500/15 px-3 py-2 text-xs text-red-200">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
