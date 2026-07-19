/** Provides a small process-local fixed-window limiter for public scan requests. */

interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

interface WindowEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function createRateLimiter(options: RateLimitOptions) {
  const entries = new Map<string, WindowEntry>();

  return {
    check(key: string, now = Date.now()): RateLimitResult {
      const current = entries.get(key);
      if (!current || now >= current.resetAt) {
        entries.set(key, { count: 1, resetAt: now + options.windowMs });
        pruneExpired(entries, now);
        return { allowed: true, retryAfterSeconds: 0 };
      }
      current.count += 1;
      return {
        allowed: current.count <= options.limit,
        retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1_000)),
      };
    },
  };
}

function pruneExpired(entries: Map<string, WindowEntry>, now: number): void {
  if (entries.size < 1_000) {
    return;
  }
  for (const [key, entry] of entries) {
    if (now >= entry.resetAt) {
      entries.delete(key);
    }
  }
}
