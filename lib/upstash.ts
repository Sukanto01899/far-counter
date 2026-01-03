// lib/upstash.ts
import { Redis } from "@upstash/redis";

if (
  process.env.UPSTASH_REDIS_REST_URL === null ||
  !process.env.UPSTASH_REDIS_REST_TOKEN === null
) {
  throw new Error(
    "Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN env vars"
  );
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
