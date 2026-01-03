import { getFarcasterDomainManifest } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET() {
  const farcasterConfig = await getFarcasterDomainManifest();

  return NextResponse.json(farcasterConfig);
}
