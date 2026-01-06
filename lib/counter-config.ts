import { base } from "wagmi/chains";

export const COUNTER_CONTRACT = process.env.NEXT_PUBLIC_COUNTER_CONTRACT as
  | `0x${string}`
  | undefined;

export const COUNTER_CHAIN_ID =
  Number(process.env.NEXT_PUBLIC_CHAIN_ID || base.id) || base.id;

export const DEFAULT_REWARD_WEI = BigInt("100000000000000"); // 0.0001 tokens at 18 decimals
export const REWARD_DECIMALS = Number(
  process.env.NEXT_PUBLIC_REWARD_DECIMALS || "18"
);

export const REWARD_SYMBOL = process.env.NEXT_PUBLIC_REWARD_SYMBOL || "jesse";

export const INCREMENT_API_PATH = "/api/signature/increment";
