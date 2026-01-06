export const MESSAGE_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30; // 30 day

export const APP_URL = process.env.NEXT_PUBLIC_URL;

if (!APP_URL) {
  throw new Error("NEXT_PUBLIC_URL or NEXT_PUBLIC_VERCEL_URL is not set");
}

export const APP_NAME = "Farcrement";
export const APP_DESCRIPTION =
  "Farcrement helps you track your Farcaster engagement metrics, wallet information, and generate cast with Ai, with detailed analytics and insights.";
export const APP_OG_IMAGE_URL = `${APP_URL}/feed.png`;
export const APP_BUTTON_TEXT = "Check State";
export const APP_SPLASH_URL = `${APP_URL}/splash.png`;
export const APP_ICON_URL = `${APP_URL}/icon.png`;
export const APP_SPLASH_BACKGROUND_COLOR = "#cb6ce6";
export const APP_PRIMARY_CATEGORY = "games";
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
    "eyJmaWQiOjIzOTUzMCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweGQzRmRBNjEyNjc2M0U3RjNkMEExRjE3RjM4YjVFMDNFNTAwM2MxQUUifQ",
  payload: "eyJkb21haW4iOiJmYXItY291bnRlci52ZXJjZWwuYXBwIn0",
  signature:
    "8sH/qJqYJ/btJXJ6HSJiURbFAYowjMvVCS7KEwSyOH0c3WX3GCaxJgUwk/dZ8qgxvXB+uogdHVn79bq7SsGybRw=",
};

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
