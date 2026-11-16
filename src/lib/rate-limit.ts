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
 * In-memory rate limiter.
 * Default: 10 requests per 10 minutes (600_000 ms).
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

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim().slice(0, 64) || "127.0.0.1";
  }
  return "127.0.0.1";
}

/**
 * Resets the in-memory store (useful for test isolation).
 */
export function resetRateLimitStore() {
  store.clear();
}
