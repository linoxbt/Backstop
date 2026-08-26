import "server-only";
import { getLivePoolState, TESTNET_TOKENS, type PoolState } from "@/lib/pancakeswap";

/**
 * A real, automatically-checkable breach condition for Meridian Rebalancer
 * (and the other PancakeSwap-v3-backed rebalancing/grid agents sharing the
 * same WBNB/USDT pool) — deliberately *not* the illustrative "bps saved vs.
 * static range" metric shown on the agent's assurance band, since that
 * number depends on the agent's actual execution history, which nothing in
 * this app observes or records.
 *
 * What we can honestly check, live and unattended: whether a functioning
 * PancakeSwap v3 WBNB/USDT pool with real liquidity currently exists at
 * all. A rebalancer's entire promise is managing an LP range in that pool
 * — if no such pool has live liquidity in any fee tier, the promise
 * cannot currently be being kept, full stop. No threshold to invent, no
 * fabricated "expected price" to compare against.
 */

export interface BreachCheckResult {
  breached: boolean;
  reason: string;
  pool: PoolState | null;
}

export function evaluatePancakeLiquidityBreach(pool: PoolState | null): BreachCheckResult {
  if (!pool) {
    return {
      breached: true,
      reason:
        "No live PancakeSwap v3 WBNB/USDT pool found with liquidity in any fee tier. The promised range-management can't be happening right now.",
      pool: null,
    };
  }
  return {
    breached: false,
    reason: `Live pool found (fee tier ${(pool.feeTier / 10000).toFixed(2)}%, tick ${pool.tick}) with real liquidity. Range-management conditions are met.`,
    pool,
  };
}

export async function checkRebalancerBreach(): Promise<BreachCheckResult> {
  const pool = await getLivePoolState(TESTNET_TOKENS.WBNB, TESTNET_TOKENS.USDT);
  return evaluatePancakeLiquidityBreach(pool);
}
