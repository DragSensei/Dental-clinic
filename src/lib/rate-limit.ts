import prisma from "@/lib/prisma";

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitRecord>();
const MAX_STORE_ENTRIES = 5000;
const PRUNE_THRESHOLD = 500;

function pruneExpired(now: number) {
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

/**
 * Synchronous in-memory rate limiter (retained for unit tests without DB).
 * Production routes use {@link checkRateLimitDb} for multi-instance consistency.
 */
export function checkRateLimit(
  key: string,
  limit = 10,
  windowMs = 10 * 60 * 1000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  if (store.size > PRUNE_THRESHOLD) {
    pruneExpired(now);
  }
  const record = store.get(key);

  if (!record || now > record.resetAt) {
    if (!record && store.size >= MAX_STORE_ENTRIES) {
      const oldestKey = store.keys().next().value;
      if (oldestKey !== undefined) store.delete(oldestKey);
    }
    const nextRecord = { count: 1, resetAt: now + windowMs };
    store.set(key, nextRecord);
    return { allowed: true, remaining: limit - 1, resetAt: nextRecord.resetAt };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt };
}

/**
 * PostgreSQL-backed atomic rate limiter for multi-instance / serverless deployments.
 * Default: 10 requests per 10 minutes (600_000 ms).
 */
export async function checkRateLimitDb(
  key: string,
  limit = 10,
  windowMs = 10 * 60 * 1000
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const nextReset = now + windowMs;
  const nowBigInt = BigInt(now);
  const nextResetBigInt = BigInt(nextReset);

  const rows = await prisma.$queryRaw<Array<{ count: number; resetAt: bigint }>>`
    INSERT INTO "api_rate_limit" ("key", "count", "resetAt")
    VALUES (${key}, 1, ${nextResetBigInt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "api_rate_limit"."resetAt" <= ${nowBigInt} THEN 1
        ELSE LEAST("api_rate_limit"."count" + 1, ${limit + 1})
      END,
      "resetAt" = CASE
        WHEN "api_rate_limit"."resetAt" <= ${nowBigInt} THEN ${nextResetBigInt}
        ELSE "api_rate_limit"."resetAt"
      END
    RETURNING "count", "resetAt"
  `;

  const row = rows[0];
  const count = Number(row?.count ?? 1);
  const resetAt = Number(row?.resetAt ?? nextReset);

  if (count === 1 && Math.random() < 0.05) {
    void prisma.apiRateLimit
      .deleteMany({ where: { resetAt: { lte: nowBigInt } } })
      .catch(() => null);
  }

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt,
  };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim().slice(0, 64) || "127.0.0.1";
  }
  return "127.0.0.1";
}

/**
 * Resets the in-memory store (useful for unit test isolation).
 */
export function resetRateLimitStore() {
  store.clear();
}

/**
 * Resets persisted rate-limit buckets (useful for integration test isolation).
 */
export async function resetRateLimitDb(keysOrPrefixes?: string[]) {
  store.clear();
  if (keysOrPrefixes && keysOrPrefixes.length > 0) {
    await prisma.apiRateLimit.deleteMany({
      where: {
        OR: keysOrPrefixes.map((p) => ({ key: { startsWith: p } })),
      },
    });
    await prisma.rateLimit.deleteMany({
      where: {
        OR: keysOrPrefixes.map((p) => ({ key: { contains: p } })),
      },
    });
    return;
  }
  await prisma.apiRateLimit.deleteMany({});
  await prisma.rateLimit.deleteMany({});
}
