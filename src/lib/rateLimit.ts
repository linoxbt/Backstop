import "server-only";

/**
 * Best-effort, in-memory rate limiter for server actions that touch the
 * chain. This is NOT a complete solution — it's a single process-local Map,
 * so it resets on every cold start and does not coordinate across multiple
 * serverless instances. What it does do: stop the trivial case (a script,
 * or an impatient double-click, hammering a real on-chain action with zero
 * cost of entry) without requiring external infrastructure (Redis/KV) this
 * project doesn't otherwise have configured. A real deployment spending a
 * wallet's real funds needs a proper distributed limiter in front of this;
 * this is a floor, not a ceiling.
 */

const lastCallAt = new Map<string, number>();

// Bound the map so a flood of distinct keys can't grow it unboundedly —
// a crude LRU-ish eviction, not precise, just a safety valve.
const MAX_TRACKED_KEYS = 1000;

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

/** Allow at most one call per `key` every `windowSeconds`. */
export function checkRateLimit(key: string, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const last = lastCallAt.get(key);
  if (last !== undefined) {
    const elapsedSeconds = (now - last) / 1000;
    if (elapsedSeconds < windowSeconds) {
      return { allowed: false, retryAfterSeconds: Math.ceil(windowSeconds - elapsedSeconds) };
    }
  }
  if (lastCallAt.size >= MAX_TRACKED_KEYS) {
    const oldestKey = lastCallAt.keys().next().value;
    if (oldestKey !== undefined) lastCallAt.delete(oldestKey);
  }
  lastCallAt.set(key, now);
  return { allowed: true };
}
