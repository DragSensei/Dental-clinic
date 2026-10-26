type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitRecord>();

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
  const record = store.get(key);

  if (!record || now > record.resetAt) {
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
    return forwarded.split(",")[0].trim();
  }
  return "127.0.0.1";
}

/**
 * Resets the in-memory store (useful for test isolation).
 */
export function resetRateLimitStore() {
  store.clear();
}
