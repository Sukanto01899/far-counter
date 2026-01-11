"use client";

import { Button } from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import { useFrame } from "@/components/providers/farcaster-provider";
import { counterAbi } from "@/lib/abi";
import {
  COUNTER_CHAIN_ID,
  COUNTER_CONTRACT,
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
const DEV_FID = Number(process.env.NEXT_PUBLIC_DEV_FID || "0");
const DEV_PROFILE_URL =
  process.env.NEXT_PUBLIC_DEV_PROFILE_URL || "https://warpcast.com/";

export default function Page() {
  const { context, haptics, quickAuth, actions } = useFrame();
  const fid = context?.user?.fid;

  const { address, isConnected } = useAccount();
  const { connectAsync, connectors, isPending: isConnecting } = useConnect();
  const { switchChainAsync } = useSwitchChain();
  const activeChainId = useChainId();

  const friendlyError = (err: unknown) => {
    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : "";
    if (!message) return "Something went wrong. Please try again.";
    const lower = message.toLowerCase();
    if (lower.includes("user rejected") || lower.includes("user denied")) {
      return "You cancelled the request. Tap again when you're ready.";
    }
    if (lower.includes("insufficient funds")) {
      return "Not enough balance to cover gas on Base. Top up and retry.";
    }
    if (lower.includes("chain") && lower.includes("mismatch")) {
      return "Wrong network. Switching to Base should fix it.";
    }
    if (lower.includes("signature") && lower.includes("expired")) {
      return "Signature expired. Tap increment again to refresh.";
    }
    return message;
  };

  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFollow, setShowFollow] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleFollowDev = async () => {
    localStorage.setItem("follow-dev-dismissed", "true");
    setShowFollow(false);
    try {
      if (DEV_FID > 0 && actions?.viewProfile) {
        await actions.viewProfile({ fid: DEV_FID });
        return;
      }
    } catch (err) {
      console.error("viewProfile failed", err);
    }
    if (typeof window !== "undefined" && DEV_PROFILE_URL) {
      window.open(DEV_PROFILE_URL, "_blank");
    }
  };

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

  const rewardQuery = useReadContract({
    abi: counterAbi,
    address: contractAddress,
    functionName: "rewardPerTap",
    chainId: COUNTER_CHAIN_ID,
    query: { enabled: Boolean(contractAddress) },
  });

  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
      chainId: COUNTER_CHAIN_ID,
    });

  const totalIncrements = (totalQuery.data as bigint | undefined) ?? BigInt(0);
  const userData = userQuery.data as [bigint, bigint] | undefined;
  const availableAt = userData?.[1] ?? BigInt(0);

  const cooldownSeconds = useMemo(() => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const availableSeconds = Number(availableAt);
    if (!availableSeconds) return 0;
    return Math.max(0, availableSeconds - nowSeconds);
  }, [availableAt]);

  const rewardPerTap = (rewardQuery.data as bigint | undefined) ?? BigInt(0);
  const rewardDisplay = useMemo(() => {
    if (rewardPerTap > BigInt(0)) {
      return formatUnits(rewardPerTap, REWARD_DECIMALS);
    }
    return "0";
  }, [rewardPerTap]);

  const formatDisplay = (value: string, digits: number) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return value;
    return num.toFixed(digits);
  };

  const rewardDisplayFixed = useMemo(
    () => formatDisplay(rewardDisplay, 4),
    [rewardDisplay]
  );

  const totalRewardsDisplay = useMemo(() => {
    if (rewardPerTap <= BigInt(0) || totalIncrements <= BigInt(0)) {
      return "0.0000";
    }
    const totalRewards = rewardPerTap * totalIncrements;
    const raw = formatUnits(totalRewards, REWARD_DECIMALS);
    return formatDisplay(raw, 4);
  }, [rewardPerTap, totalIncrements]);

  useEffect(() => {
    if (isConfirmed) {
      totalQuery.refetch?.();
      userQuery.refetch?.();
      setStatus("Increment confirmed onchain");
      setShowSuccess(true);
      haptics?.notificationOccurred?.("success");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed]);

  useEffect(() => {
    const alreadyFollowed = localStorage.getItem("follow-dev-dismissed");
    if (!alreadyFollowed) {
      setShowFollow(true);
    }
  }, []);

  const handleIncrement = async () => {
    setError(null);
    setStatus(null);
    setShowSuccess(false);

    if (!contractAddress) {
      setError("Set NEXT_PUBLIC_COUNTER_CONTRACT to your deployed contract.");
      return;
    }

    if (!fid) {
      setError("Farcaster fid missing from SDK context.");
      return;
    }

    if (!quickAuth || typeof quickAuth.getToken !== "function") {
      setError("Auth unavailable. Please reopen in Farcaster.");
      return;
    }

    setIsActionLoading(true);
    try {
      const token =
        quickAuth.token ??
        (await quickAuth.getToken({ force: "false" })).token ??
        null;
      if (!token) {
        setError("Auth token missing. Please try again.");
        return;
      }
      // Use plain fetch with explicit auth header to avoid unbound method issues.

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
        setStatus("Switched to Base");
      }

      setStatus("Fetching server signature...");
      const signatureRes = await fetch(INCREMENT_API_PATH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
          "x-fid": fid.toString(),
        },
        body: JSON.stringify({
          userAddress,
          contract: contractAddress,
        }),
        cache: "no-store",
      });

      const signatureJson = await signatureRes.json();
      console.log(signatureJson);
      if (!signatureRes.ok || !signatureJson.signature) {
        throw new Error(signatureJson.error || "Failed to fetch signature");
      }

      const requestStruct = {
        user: userAddress as `0x${string}`,
        fid: BigInt(fid),
        nonce: BigInt(signatureJson.nonce),
        deadline: BigInt(signatureJson.deadline),
      };

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
      setError(friendlyError(err));
      setStatus(null);
    } finally {
      setIsActionLoading(false);
    }
  };

  const isProcessing =
    isConnecting ||
    isWriting ||
    isConfirming ||
    status === "Waiting for confirmation..." ||
    isActionLoading;

  const disableIncrement =
    cooldownSeconds > 0 || !contractAddress || !fid || isProcessing;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-[#0a0f22] via-[#070a17] to-[#05070f] text-white">
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-cyan-500/25 blur-3xl" />
      <div className="pointer-events-none absolute right-[-10%] top-24 h-48 w-48 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-44 w-72 -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(70,130,255,0.18),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(120,255,240,0.12),transparent_45%)]" />

      <div className="relative flex h-full w-full flex-col">
        {showFollow && (
          <Modal>
            <div className="w-full max-w-sm rounded-2xl border border-blue-500/40 bg-slate-900/90 p-5 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-blue-400 animate-pulse" />
                  <p className="text-xs uppercase tracking-wide text-blue-100">
                    Welcome
                  </p>
                </div>
                <button
                  className="text-slate-300 hover:text-white text-sm"
                  onClick={() => {
                    localStorage.setItem("follow-dev-dismissed", "true");
                    setShowFollow(false);
                  }}
                >
                  Close
                </button>
              </div>
              <div className="mt-3 space-y-3">
                <h2 className="text-xl font-bold">Follow the dev</h2>
                <p className="text-sm text-slate-300">
                  Stay updated on new drops and tweaks. One tap and this won't
                  show again.
                </p>
                <button
                  onClick={handleFollowDev}
                  className="block w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-center text-sm font-semibold shadow-lg shadow-blue-700/40"
                >
                  Follow dev on Warpcast
                </button>
              </div>
            </div>
          </Modal>
        )}
        {showSuccess && (
          <Modal>
            <div className="w-full max-w-sm rounded-2xl border border-blue-500/40 bg-slate-900/90 p-5 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-xs uppercase tracking-wide text-emerald-200">
                    Success
                  </p>
                </div>
                <button
                  className="text-slate-300 hover:text-white text-sm"
                  onClick={() => setShowSuccess(false)}
                >
                  Close
                </button>
              </div>
              <div className="mt-3 space-y-2">
                <h2 className="text-xl font-bold">
                  You got {rewardDisplay} {REWARD_SYMBOL}
                </h2>
                <p className="text-sm text-slate-300">
                  Come back after 6 hours to tap again. Keep the streak alive!
                </p>
                {txHash && (
                  <a
                    href={`https://basescan.org/tx/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-200 underline"
                  >
                    View on BaseScan
                  </a>
                )}
                <Button
                  onClick={() => setShowSuccess(false)}
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-sm font-semibold"
                >
                  Got it
                </Button>
              </div>
            </div>
          </Modal>
        )}

        <div className="relative flex h-full w-full flex-col justify-between border border-cyan-400/20 bg-gradient-to-b from-[#0b1226] via-[#0a1020] to-[#090e1a] px-6 py-8 shadow-[0_25px_60px_rgba(7,10,24,0.8)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 border border-cyan-500/10" />
          <div className="pointer-events-none absolute left-6 top-20 h-2 w-2 rounded-sm bg-cyan-400/70 shadow-[0_0_12px_rgba(56,189,248,0.6)]" />
          <div className="pointer-events-none absolute right-10 top-40 h-3 w-3 rounded-sm bg-cyan-500/60 shadow-[0_0_16px_rgba(56,189,248,0.6)]" />
          <div className="pointer-events-none absolute left-12 bottom-36 h-2.5 w-2.5 rounded-sm bg-emerald-400/70 shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
          <div className="pointer-events-none absolute right-14 bottom-44 h-2 w-2 rounded-full bg-cyan-200/70 shadow-[0_0_10px_rgba(125,211,252,0.6)]" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-200/70">
              Total user rewards claimed
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-200 shadow-[0_0_20px_rgba(56,189,248,0.45)]">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 256 256"
                  className="h-5 w-5"
                >
                  <path
                    fill="currentColor"
                    d="M127.9 16 34.3 144.2l93.6 54.1 93.9-54.1L127.9 16zm0 182.4-93.6-54.1 93.6 139.7 93.8-139.7-93.8 54.1z"
                  />
                </svg>
              </span>
              <span className="text-4xl font-black tracking-tight text-white drop-shadow-sm">
                {totalRewardsDisplay}
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/70">
                {REWARD_SYMBOL}
              </span>
            </div>
          </div>

          <div className="relative mt-8 flex justify-center">
            <div className="absolute -top-4 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl" />
            <div className="flex h-36 w-36 items-center justify-center rounded-full border border-cyan-500/20 bg-gradient-to-b from-slate-900/60 to-slate-950/80 shadow-[inset_0_0_25px_rgba(14,116,144,0.3)]">
              <svg
                aria-hidden="true"
                viewBox="0 0 256 256"
                className="h-20 w-20 text-cyan-300 drop-shadow-[0_0_20px_rgba(56,189,248,0.45)]"
              >
                <path
                  fill="currentColor"
                  d="M127.9 16 34.3 144.2l93.6 54.1 93.9-54.1L127.9 16zm0 182.4-93.6-54.1 93.6 139.7 93.8-139.7-93.8 54.1z"
                />
              </svg>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-2 rounded-full border border-cyan-500/25 bg-slate-950/60 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-cyan-100/80 shadow-[inset_0_0_12px_rgba(56,189,248,0.2)]">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-cyan-300/80" />
                <span className="h-2 w-2 rounded-full bg-slate-400/70" />
                <span className="h-2 w-2 rounded-full bg-cyan-200/70" />
              </span>
              Live rewards active
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Button
              onClick={handleIncrement}
              isLoading={isProcessing}
              disabled={disableIncrement}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-emerald-400 to-emerald-500 py-3.5 text-base font-extrabold uppercase tracking-wide shadow-[0_16px_30px_rgba(16,185,129,0.35)] transition hover:scale-[1.01] hover:brightness-110 disabled:scale-100 disabled:opacity-60"
            >
              {isProcessing
                ? "Claiming..."
                : cooldownSeconds > 0
                ? "Come back after 6h"
                : `Claim ${rewardDisplayFixed} ${REWARD_SYMBOL}`}
            </Button>
            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400 text-center">
              Secure blockchain claim - 6h interval
            </p>
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
