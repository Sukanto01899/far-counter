import { NextRequest, NextResponse } from "next/server";
import { privateKeyToAccount } from "viem/accounts";

const DEFAULT_REWARD_WEI = BigInt(
  process.env.INCREMENT_REWARD_WEI || "100000000000000" // 0.0001 tokens (decimals depend on token)
);
const DEFAULT_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "8453");

export async function POST(request: NextRequest) {
  const { userAddress, contract } = await request.json();
  const fid = request.headers.get("x-fid");

  if (!userAddress || !fid || !contract) {
    return NextResponse.json(
      { error: "Invalid input", isSuccess: false },
      { status: 400 }
    );
  }

  const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY;
  if (!SERVER_PRIVATE_KEY) {
    return NextResponse.json(
      { error: "Server configuration error", isSuccess: false },
      { status: 500 }
    );
  }

  try {
    const account = privateKeyToAccount(SERVER_PRIVATE_KEY as `0x${string}`);
    const nonce = BigInt(Date.now());
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 30 * 60); // 30 minutes to submit

    const signature = await account.signTypedData({
      domain: {
        name: "FarCounter",
        version: "1",
        chainId: DEFAULT_CHAIN_ID,
        verifyingContract: contract as `0x${string}`,
      },
      types: {
        Increment: [
          { name: "user", type: "address" },
          { name: "fid", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
          { name: "reward", type: "uint256" },
        ],
      },
      primaryType: "Increment",
      message: {
        user: userAddress as `0x${string}`,
        fid: BigInt(fid),
        nonce,
        deadline,
        reward: DEFAULT_REWARD_WEI,
      },
    });

    return NextResponse.json(
      {
        fid,
        nonce: nonce.toString(),
        deadline: deadline.toString(),
        reward: DEFAULT_REWARD_WEI.toString(),
        signature,
        chainId: DEFAULT_CHAIN_ID,
        isSuccess: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to sign increment request", error);
    return NextResponse.json(
      { error: "Unauthorized", isSuccess: false },
      { status: 401 }
    );
  }
}
