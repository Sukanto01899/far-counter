import {
  APP_ACCOUNT_ASSOCIATION,
  APP_BUTTON_TEXT,
  APP_DESCRIPTION,
  APP_ICON_URL,
  APP_NAME,
  APP_OG_IMAGE_URL,
  APP_PRIMARY_CATEGORY,
  APP_SPLASH_BACKGROUND_COLOR,
  APP_SPLASH_URL,
  APP_TAGS,
  APP_URL,
  APP_WEBHOOK_URL,
} from "./constants";

export function getMiniAppEmbedMetadata(ogImageUrl?: string) {
  return {
    version: "next",
    imageUrl: ogImageUrl,
    ogTitle: APP_NAME,
    ogDescription: APP_DESCRIPTION,
    ogImageUrl: ogImageUrl ?? APP_OG_IMAGE_URL,
    button: {
      title: APP_BUTTON_TEXT,
      action: {
        type: "launch_frame",
        name: APP_NAME,
        url: APP_URL,
        splashImageUrl: APP_SPLASH_URL,
        iconUrl: APP_ICON_URL,
        splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
        description: APP_DESCRIPTION,
        primaryCategory: APP_PRIMARY_CATEGORY,
        tags: APP_TAGS,
      },
    },
  };
}
export async function getFarcasterDomainManifest() {
  return {
    accountAssociation: APP_ACCOUNT_ASSOCIATION!,
    miniapp: {
      version: "1",
      name: APP_NAME ?? "Farstate Ai",
      homeUrl: APP_URL,
      iconUrl: APP_ICON_URL,
      imageUrl: APP_OG_IMAGE_URL,
      buttonTitle: "Check State",
      splashImageUrl: APP_SPLASH_URL,
      splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
      webhookUrl: APP_WEBHOOK_URL,
      primaryCategory: APP_PRIMARY_CATEGORY,
      tags: APP_TAGS,
      subtitle: "Track Farcaster score and info",
      description: APP_DESCRIPTION,
      tagline: "Farcaster Analytics",
      ogTitle: "Farstate - Farcaster Analytics",
      requiredChains: ["eip155:8453", "eip155:1"],
      castShareUrl: `${APP_URL}/share`,
    },
    baseBuilder: {
      ownerAddress: "0xB23955A49c9974a40e68717813a108002072a368",
    },
  };
}
export const truncateAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 14)}...${address.slice(-12)}`;
};
