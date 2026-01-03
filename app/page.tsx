import App from "@/components/app";
import { APP_URL, APP_SPLASH_BACKGROUND_COLOR } from "@/lib/constants";
import type { Metadata } from "next";

const frame = {
  version: "next",
  imageUrl: `${APP_URL}/feed.png`,
  button: {
    title: "Check State",
    action: {
      type: "launch_frame",
      name: "Farstate Ai",
      url: APP_URL,
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR || "#1E90FF",
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Farstate Ai",
    openGraph: {
      title: "Farstate Ai Farcaster Activity Checker",
      description: "A base ecosystem mini game for check status and earn!",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return <App />;
}
