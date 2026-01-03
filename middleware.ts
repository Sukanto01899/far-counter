// middleware/auth.ts
import { NextResponse, type NextRequest } from "next/server";
import { createClient, Errors } from "@farcaster/quick-auth";

const client = createClient();

export async function middleware(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  //   console.log("Auth Header:", authHeader);
  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  // console.log("Token:", token);

  try {
    const deploymentDomain = process.env.DOMAIN || request.nextUrl.host;
    if (!deploymentDomain) {
      return NextResponse.json(
        { error: "Missing deployment domain" },
        { status: 500 }
      );
    }
    // console.log("Verifying token for domain:", deploymentDomain);
    const payload = await client.verifyJwt({
      token,
      domain: deploymentDomain,
    });
    // payload.sub = user FID
    // console.log("Authenticated FID:", payload);

    if (!payload.sub) {
      return NextResponse.json(
        { error: "Invalid token payload" },
        {
          status: 401,
        }
      );
    }

    //add fid on header
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-fid", payload.sub.toString());

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (e) {
    if (e instanceof Errors.InvalidTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    // thow other errors
    console.error("Auth middleware error:", e);
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 }
    );
  }
}

// middleware  route matcher
export const config = {
  matcher: [
    "/api/auth/signature/:path*",
    "/api/signature/:path*",
    "/api/ai/create-thumbnail",
    "/api/ai/create-cast",
  ], // PROTECT all /api/auth/* routes
};
