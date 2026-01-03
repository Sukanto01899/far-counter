import { MiniAppNotificationDetails } from "@farcaster/miniapp-sdk";
import { redis } from "./upstash";

const KEY_PREFIX = "notification:";

function getUserNotificationDetailsKey(fid: number): string {
  return `${KEY_PREFIX}${fid}`;
}

export async function getUserNotificationDetails(
  fid: number
): Promise<MiniAppNotificationDetails | null> {
  return await redis.get<MiniAppNotificationDetails>(
    getUserNotificationDetailsKey(fid)
  );
}

export async function getUsersNotificationDetails(): Promise<
  MiniAppNotificationDetails[]
> {
  let cursor = "0";
  const allUsers: MiniAppNotificationDetails[] = [];

  do {
    const [newCursor, keys] = await redis.scan(cursor, {
      match: `*`,
      count: 1000,
    });
    cursor = newCursor;

    if (keys.length > 0) {
      const details = (await redis.mget(
        ...keys
      )) as (MiniAppNotificationDetails | null)[];
      allUsers.push(
        ...details.filter((d): d is MiniAppNotificationDetails => d !== null)
      );
    }
  } while (cursor !== "0");

  const filterUser = allUsers.filter((u) => typeof u?.url === "string");

  return filterUser;
}

export async function setUserNotificationDetails(
  fid: number,
  notificationDetails: MiniAppNotificationDetails
): Promise<void> {
  await redis.set(getUserNotificationDetailsKey(fid), notificationDetails);
}

export async function deleteUserNotificationDetails(
  fid: number
): Promise<void> {
  await redis.del(getUserNotificationDetailsKey(fid));
}

export async function removeInvalidNotificationTokens(
  invalidTokens: string[]
): Promise<void> {
  if (!Array.isArray(invalidTokens) || invalidTokens.length === 0) {
    return;
  }

  const invalidTokenSet = new Set(invalidTokens);
  const delPromises: Promise<number>[] = [];
  let cursor = "0";

  do {
    const [nextCursor, keys] = await redis.scan(cursor, {
      match: `${KEY_PREFIX}*`,
      count: 1000,
    });
    cursor = nextCursor;

    if (keys.length > 0) {
      const details = (await redis.mget(...keys)) as ({
        url: string;
        token: string;
      } | null)[];

      keys.forEach((key, index) => {
        const detail = details[index];
        if (detail && invalidTokenSet.has(detail.token)) {
          delPromises.push(redis.del(key));
        }
      });
    }
  } while (cursor !== "0");

  await Promise.all(delPromises);
}
