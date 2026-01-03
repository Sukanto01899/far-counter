// lib/limits.ts
import { redis } from "./upstash";

export const STANDARD_TEXT_LIMIT = 5;
export const STANDARD_IMAGE_LIMIT = 1;
export const SUB_TEXT_LIMIT = 20;
export const SUB_IMAGE_LIMIT = 10;

/** Return YYYY-MM-DD string for Asia/Dhaka (UTC+6) */
export function currentDateDhaka(): string {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const dhakaMs = utcMs + 6 * 60 * 60 * 1000;
  const d = new Date(dhakaMs);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Seconds until next midnight in Asia/Dhaka */
export function secondsUntilDhakaMidnight(): number {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const dhakaMs = utcMs + 6 * 60 * 60 * 1000;
  const d = new Date(dhakaMs);
  // Next midnight (Dhaka)
  const next = Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate() + 1,
    0,
    0,
    0
  );
  const seconds = Math.max(0, Math.floor((next - d.getTime()) / 1000));
  return seconds;
}

/** Read rate counter */
export async function getRateCount(
  userId: string,
  dateKey: string,
  content: string
): Promise<number> {
  let key: string;
  if (content === "image") {
    key = `image_rate:${userId}:${dateKey}`;
  } else {
    key = `text_rate:${userId}:${dateKey}`;
  }

  const v = await redis.get(key);
  return v === null ? 0 : Number(v);
}

/** Increment rate counter and ensure TTL set to Dhaka midnight (expires at midnight) */
export async function incrRateCount(
  userId: string,
  dateKey: string,
  content: string
): Promise<number> {
  let key: string;
  if (content === "image") {
    key = `image_rate:${userId}:${dateKey}`;
  } else {
    key = `text_rate:${userId}:${dateKey}`;
  }
  const newCount = await redis.incr(key);
  // If this is the first increment, set expire to Dhaka midnight
  if (newCount === 1) {
    const ttl = secondsUntilDhakaMidnight();
    // set expiration (Upstash SDK supports expire)
    await redis.expire(key, ttl);
  }
  return newCount;
}

/** Store subscription: value should be JSON string or expiresAt number. We set TTL to durationSeconds */
export async function setSubscription(
  userFid: string,
  subValue: string,
  durationSeconds: number
) {
  const key = `sub:${userFid}`;
  // set with TTL in seconds
  await redis.set(key, subValue, { ex: durationSeconds });
}
/** Store TxHasg: value should be JSON string or expiresAt number. We set TTL to durationSeconds */
export async function setTxHash(userFid: string, durationSeconds: number) {
  const key = `tx:${userFid}`;
  // set with TTL in seconds
  await redis.set(key, userFid, { ex: durationSeconds });
}

/** Read subscription raw value (string) */
export async function getSubscription(userFid: string): Promise<string | null> {
  const key = `sub:${userFid}`;
  const v = await redis.get(key);

  if (v === null) return null;

  // If it's already an object, stringify it
  if (typeof v === "object") {
    return JSON.stringify(v);
  }

  // Otherwise return as string
  return String(v);
}
