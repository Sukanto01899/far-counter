// import { contractAbi } from "@/abi/abi";
// import { createPublicClient, createWalletClient, http } from "viem";
// import { baseSepolia } from "viem/chains";
// import { custom } from "zod";
// import client from "./client";

// export const publicClient = createPublicClient({
//   chain: baseSepolia,
//   transport: http(),
// });

// const data = await publicClient.readContract({
//   address: contractAbi.DailyLottery.address,
//   abi: contractAbi.DailyLottery.abi,
//   functionName: "getDrawStatus",
// });

// async function getDrawStatus(): Promise<
//   readonly [
//     bigint,
//     bigint,
//     boolean,
//     bigint,
//     bigint,
//     bigint,
//     boolean,
//     bigint,
//     bigint,
//     boolean,
//     bigint
//   ]
// > {
//   try {
//     const data = await publicClient.readContract({
//       address: contractAbi.DailyLottery.address,
//       abi: contractAbi.DailyLottery.abi,
//       functionName: "getDrawStatus",
//     });
//     console.log(data);

//     return data;
//   } catch (error) {
//     throw new Error("can draw fetching failed!");
//   }
// }

// export async function drawTheLottery() {
//   try {
//     const canDraw = await getDrawStatus();

//     if (!canDraw[2]) {
//       return null;
//     }

//     const txHash = client.writeContract({
//       address: contractAbi.DailyLottery.address as `0x${string}`,
//       abi: contractAbi.DailyLottery.abi,
//       functionName: "drawWinners",
//     });
//     return txHash;
//   } catch (error) {
//     throw new Error("Draw failed");
//   }
// }
// export async function exitCooldown() {
//   try {
//     const isCooldown = await getDrawStatus();

//     if (!isCooldown[9]) {
//       return null;
//     }

//     const txHash = client.writeContract({
//       address: contractAbi.DailyLottery.address as `0x${string}`,
//       abi: contractAbi.DailyLottery.abi,
//       functionName: "exitCooldown",
//     });
//     return txHash;
//   } catch (error) {
//     throw new Error("Draw failed");
//   }
// }
