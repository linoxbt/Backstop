import type { PoolState } from "@/lib/pancakeswap";
import type { PoolDrift } from "@/lib/chain/poolSnapshots";

/**
 * Real PancakeSwap v3 pool telemetry — current state plus a drift summary
 * computed from a real snapshot history (src/lib/chain/poolSnapshots.ts).
 * Deliberately never claims this is the agent's own performance: the tick
 * drift is a fact about the real market, not a simulated "what the agent
 * would have done." The assurance band above this component on the dossier
 * page is still the (static, separately labeled) claim about the agent
 * itself — this is the one piece of that page backed by an accumulating
 * real measurement instead of hand-authored numbers.
 */
export function PoolTelemetry({
  pool,
  drift,
  snapshotCount,
}: {
  pool: PoolState;
  drift: PoolDrift | null;
  snapshotCount: number;
}) {
  return (
    <div className="-mt-8 mb-12 font-data text-[12px] text-paper-ink-faint">
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <span className="text-verdigris">●</span>
        <span>
          Live PancakeSwap v3 pool — WBNB/USDT, {(pool.feeTier / 10000).toFixed(2)}% tier, tick{" "}
          {pool.tick}
        </span>
        <a
          href={`https://testnet.bscscan.com/address/${pool.poolAddress}`}
          target="_blank"
          rel="noreferrer"
          className="hover:text-bronze-text transition-colors"
        >
          {pool.poolAddress.slice(0, 8)}…{pool.poolAddress.slice(-6)} ↗
        </a>
      </div>
      {drift ? (
        <p className="mt-1.5 max-w-2xl leading-relaxed">
          Real, independently observed — not this agent&rsquo;s own claimed performance: the pool&rsquo;s
          tick moved {Math.abs(drift.tickDelta)} {drift.tickDelta === 0 ? "" : drift.tickDelta > 0 ? "up" : "down"}{" "}
          ({drift.oldestTick} → {drift.newestTick}) over the last{" "}
          {drift.windowHours < 1 ? `${Math.round(drift.windowHours * 60)} min` : `${drift.windowHours.toFixed(1)}h`},
          across {drift.snapshotCount} recorded checks.
        </p>
      ) : snapshotCount === 0 ? (
        <p className="mt-1.5 max-w-2xl leading-relaxed">
          Recording real pool snapshots every 30 minutes (see the auto-rebate cron) — not enough
          history yet to show real drift over time.
        </p>
      ) : null}
    </div>
  );
}
