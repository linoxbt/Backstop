import "server-only";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import type { PoolState } from "@/lib/pancakeswap";

/**
 * Real, independently-captured PancakeSwap v3 pool telemetry — not a claim
 * about any agent's own trading performance (that's `AssuranceBand.realized`
 * in src/lib/agents.ts, still static/illustrative — see that file's own
 * doc comments). This module only ever records/reads what the real pool
 * itself actually did, on the same shared WBNB/USDT testnet pool every
 * PancakeSwap-tracking real agent's dossier page already reads live via
 * `getLivePoolState` (src/lib/pancakeswap.ts). Recorded every 30 minutes by
 * the existing authenticated cron (src/app/api/cron/rebalance-check), so a
 * real history accumulates over time without any new secret or workflow.
 */

export interface PoolSnapshotRow {
  tick: number;
  liquidity: string;
  price: number;
  feeTier: number;
  capturedAt: string;
}

/** Insert one real snapshot. Called only from the authenticated cron path. */
export async function recordPoolSnapshot(pool: PoolState): Promise<{ ok: boolean; error?: string }> {
  if (!supabaseAdmin) {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY unset — snapshot not recorded." };
  }
  const { error } = await supabaseAdmin.from("pool_snapshots").insert({
    pool_address: pool.poolAddress,
    fee_tier: pool.feeTier,
    tick: pool.tick,
    liquidity: pool.liquidity,
    price: pool.price,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Most recent snapshots for a pool, newest first. Public read — no service role needed. */
export async function getRecentPoolSnapshots(poolAddress: string, limit = 50): Promise<PoolSnapshotRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("pool_snapshots")
    .select("tick, liquidity, price, fee_tier, captured_at")
    .eq("pool_address", poolAddress)
    .order("captured_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map((r) => ({
    tick: r.tick,
    liquidity: r.liquidity,
    price: r.price,
    feeTier: r.fee_tier,
    capturedAt: r.captured_at,
  }));
}

export interface PoolDrift {
  /** Real tick delta between the oldest and newest snapshot in the window. */
  tickDelta: number;
  /** Real elapsed time the window actually covers. */
  windowHours: number;
  oldestTick: number;
  newestTick: number;
  snapshotCount: number;
}

/**
 * Pure derivation, no I/O: how much the real pool's tick has actually moved
 * across a real snapshot history. Deliberately does NOT produce a "bps
 * saved" or any agent-attributed number — that would require simulating
 * what a rebalancing strategy would have done, which is exactly the kind of
 * fabrication this codebase's own honesty policy rules out. This is only
 * "how much did the real market move," a fact independent of any agent.
 */
export function computePoolDrift(snapshotsNewestFirst: PoolSnapshotRow[]): PoolDrift | null {
  if (snapshotsNewestFirst.length < 2) return null;
  const newest = snapshotsNewestFirst[0];
  const oldest = snapshotsNewestFirst[snapshotsNewestFirst.length - 1];
  const windowMs = new Date(newest.capturedAt).getTime() - new Date(oldest.capturedAt).getTime();
  return {
    tickDelta: newest.tick - oldest.tick,
    windowHours: windowMs / (1000 * 60 * 60),
    oldestTick: oldest.tick,
    newestTick: newest.tick,
    snapshotCount: snapshotsNewestFirst.length,
  };
}
