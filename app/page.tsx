import App from "@/components/app";
import { APP_URL, APP_SPLASH_BACKGROUND_COLOR } from "@/lib/constants";
import type { Metadata } from "next";

const frame = {
  version: "next",
  imageUrl: `${APP_URL}/feed.png`,
  button: {
    title: "Tap Now",
    action: {
      type: "launch_frame",
      name: "Farcrement",
      url: APP_URL,
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR || "#1E90FF",
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Farcrement",
    openGraph: {
      title: "Tap to level up your streak with Farcrement!",
      description: "A base ecosystem mini game for Farcasters.",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return <App />;
}
