import { createPublicClient, createWalletClient, http } from "viem";
import { base } from "viem/chains";

// if (!process.env.SERVER_PRIVATE_KEY) {
//   throw new Error("Private key not found!");
// }

const rpcUrl =
  process.env.ALCHEMY_RPC_URL ||
  "https://base-sepolia.g.alchemy.com/v2/y-actUyaM6bEJqmVIO8p7";

// const account = privateKeyToAccount(
//   process.env.SERVER_PRIVATE_KEY as `0x${string}`
// );

// const client = createWalletClient({
//   chain: baseSepolia,
//   transport: http(),
// });

export const publicClient = createPublicClient({
  chain: base,
  transport: http(rpcUrl),
});

// export default client;
