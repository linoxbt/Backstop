import "server-only";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Best-effort, in-memory rate limiter for server actions that touch the
 * chain. This is NOT a complete solution — it's a single process-local Map,
 * so it resets on every cold start and does not coordinate across multiple
 * serverless instances. What it does do: stop the trivial case (a script,
 * or an impatient double-click, hammering a real on-chain action with zero
 * cost of entry) without requiring external infrastructure (Redis/KV) this
 * project doesn't otherwise have configured. A real deployment spending a
 * wallet's real funds needs a proper distributed limiter in front of this —
 * see `checkRateLimitPersistent` below, which is that limiter now that
 * Supabase is already a project dependency.
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

/**
 * Cross-instance rate limit backed by Postgres (the `check_rate_limit`
 * function — see supabase/migrations/*_create_rate_limit_fn.sql). Unlike
 * `checkRateLimit`, this coordinates across every serverless instance and
 * survives a cold start, because the "last call" fact lives in the
 * database, not process memory.
 *
 * Falls back to the in-memory limiter when Supabase isn't configured — the
 * same honest-gating shape used everywhere else in this app (attempt the
 * real thing, degrade to a clearly-lesser fallback rather than failing
 * closed or open silently).
 */
export async function checkRateLimitPersistent(key: string, windowSeconds: number): Promise<RateLimitResult> {
  if (!supabaseAdmin) {
    return checkRateLimit(key, windowSeconds);
  }
  const { data, error } = await supabaseAdmin.rpc("check_rate_limit", {
    p_key: key,
    p_window_seconds: Math.ceil(windowSeconds),
  });
  if (error) {
    // Database unreachable — fall back rather than let a transient outage
    // block (or worse, silently un-gate) a real on-chain-spending action.
    return checkRateLimit(key, windowSeconds);
  }
  if (data === true) return { allowed: true };
  return { allowed: false, retryAfterSeconds: Math.ceil(windowSeconds) };
}
