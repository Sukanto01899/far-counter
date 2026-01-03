import { decodeEventLog, parseAbiItem, parseEventLogs } from "viem";
import { publicClient } from "./client";
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
import { abi } from "@/contracts/abi";

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

/**
 * Verify transaction on-chain
 */
const CONTRACT_ADDRESS = abi.AiSubscription.address;
export async function verifyTransaction(txHash: string) {
  try {
    const tx = await publicClient.getTransaction({
      hash: txHash as `0x${string}`,
    });

    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    // Check if transaction was successful
    if (receipt.status !== "success") {
      return { valid: false, error: "Transaction failed" };
    }

    // Verify transaction is to our contract
    if (tx.to?.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
      return { valid: false, error: "Transaction not to our contract" };
    }

    const paymentReceivedEvent = parseAbiItem(
      "event PaymentReceived(bytes32 indexed paymentId, address indexed user, uint256 indexed fid, uint256 months, uint256 amount, uint256 timestamp)"
    );

    // Find PaymentReceived event in logs
    let paymentData: any = null;

    // console.log(receipt);

    for (const log of receipt.logs) {
      console.log("\nChecking log:");
      console.log("  Address:", log.address);
      console.log("  Topics:", log.topics);

      // Check if from our contract
      if (log.address.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
        // console.log("  ❌ Not from our contract");
        continue;
      }

      try {
        const decoded = decodeEventLog({
          abi: [paymentReceivedEvent],
          data: log.data,
          topics: log.topics,
        });

        // console.log("  ✅ Decoded:", decoded);

        if (decoded.eventName === "PaymentReceived") {
          paymentData = decoded.args;
          // console.log("  ✅ Payment data found!");
          break;
        }
      } catch (error) {
        console.log("  ❌ Decode error:", error);
        continue;
      }
    }

    if (!paymentData) {
      return { valid: false, error: "PaymentReceived event not found" };
    }

    return {
      valid: true,
      paymentId: paymentData.paymentId,
      user: paymentData.user,
      months: Number(paymentData.months),
      amount: paymentData.amount,
      fid: paymentData.fid,
      timestamp: Number(paymentData.timestamp),
    };
  } catch (error) {
    console.error("Transaction verification error:", error);
    return { valid: false, error: (error as Error).message };
  }
}
