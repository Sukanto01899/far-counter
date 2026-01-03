import {
  AwardIcon,
  CheckCircle,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

export const MESSAGE_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30; // 30 day

export const APP_URL = process.env.NEXT_PUBLIC_URL;

if (!APP_URL) {
  throw new Error("NEXT_PUBLIC_URL or NEXT_PUBLIC_VERCEL_URL is not set");
}

export const APP_NAME = "Farstate Ai";
export const APP_DESCRIPTION =
  "Farstate Ai helps you track your Farcaster engagement metrics, wallet information, and generate cast with Ai, with detailed analytics and insights.";
export const APP_OG_IMAGE_URL = `${APP_URL}/feed.png`;
export const APP_BUTTON_TEXT = "Check State";
export const APP_SPLASH_URL = `${APP_URL}/splash.png`;
export const APP_ICON_URL = `${APP_URL}/icon.png`;
export const APP_SPLASH_BACKGROUND_COLOR = "#cb6ce6";
export const APP_PRIMARY_CATEGORY = "social";
export const APP_TAGS = [
  "neynar",
  "farcaster",
  "analytics",
  "reputation",
  "ai",
];
export const APP_WEBHOOK_URL = `${APP_URL}/api/webhook`;
export const APP_ACCOUNT_ASSOCIATION = {
  header:
    "eyJmaWQiOjMxNzI2MSwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDQ5ZWUzMjNFYTFCYjY1RjY4RkE3NWRmMGM2RDQ0MWQyMGQ4M0E4Q2QifQ",
  payload: "eyJkb21haW4iOiJmYXJzdGF0ZS52ZXJjZWwuYXBwIn0",
  signature:
    "TAFouFoy5C5A5APwUo+lvqNqvNj/RuSC9DCZ2eeFAwZgbQwABnOPl9+WcoYE4Z0PvC0ycFEJxYQQdidCGZwL5hw=",
};

export const castCategories = [
  {
    id: 1,
    name: "Tech News",
    icon: Zap,
    color: "border-purple-600",
  },
  {
    id: 2,
    name: "Crypto Updates",
    icon: TrendingUp,
    color: "border-purple-600",
  },
  {
    id: 3,
    name: "Motivational",
    icon: AwardIcon,
    color: "border-purple-600",
  },
  {
    id: 4,
    name: "Community",
    icon: MessageSquare,
    color: "border-purple-600",
  },
  {
    id: 5,
    name: "Meme",
    icon: Sparkles,
    color: "border-purple-600",
  },
  {
    id: 6,
    name: "Question",
    icon: CheckCircle,
    color: "border-purple-600",
  },
];

export const notificationsBtn = [
  {
    id: 1,
    name: "Score Check",
    title: "🎉 Check you Neyner score today.",
    body: "Open Farstate Ai & Check your Neyner score!",
  },
  {
    id: 2,
    name: "Daily Cast",
    title: "🏆 Make cast with Ai today!",
    body: "Generate cast wih Ai and Cast it instant  🥇!",
  },
  {
    id: 3,
    name: "Increase score?",
    title: "How to increase Neyner score?",
    body: "FCFS giveaway started. Open app and claim now ⚡!",
  },
  {
    id: 4,
    name: "Rewards",
    title: "💰 Claim DEGEN Drop now!",
    body: "DEGEN Exclusive drop claiming started (FCFS)⚡!",
  },
  {
    id: 5,
    name: "Rewards",
    title: "💰 Did you claim your DEGEN Today?",
    body: "Keep your streak going strong, check-in now⚡!",
  },
];

import { defineChain } from "viem";

export const Monad = defineChain({
  id: 143,
  name: "Monad",
  nativeCurrency: {
    decimals: 18,
    name: "Monad",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.monad.xyz"],
      webSocket: ["wss://rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://monadscan.com" },
  },
});
