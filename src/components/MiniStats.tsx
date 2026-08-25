import Link from "next/link";
import { POOL } from "@/lib/pool";

/**
 * Compact 4-tile stat row, Agentic Market's mini-stat-card position — the
 * same illustrative pool figures already shown (and labeled as such) on
 * /pool, reused here rather than inventing a "live" variant.
 */
export function MiniStats() {
  const tiles = [
    { label: "Pool balance", value: POOL.tvl, note: POOL.tvlUnit },
    { label: "Payout ratio", value: POOL.payoutRatio, note: POOL.payoutRatioNote },
    { label: "Solvency buffer", value: POOL.solvencyBuffer, note: POOL.solvencyBufferNote },
    {
      label: "Rebates paid",
      value: POOL.totalRebatesPaid,
      note: `${POOL.totalRebatesCount} payouts`,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 border border-paper-line divide-x divide-paper-line">
      {tiles.map((t) => (
        <div key={t.label} className="p-4">
          <span className="font-data text-[10px] uppercase tracking-wider text-paper-ink-faint block mb-1">
            {t.label}
          </span>
          <span className="font-display text-xl tabnum block">{t.value}</span>
          <span className="font-data text-[10px] text-paper-ink-faint">{t.note}</span>
        </div>
      ))}
      <Link
        href="/pool"
        className="col-span-2 sm:col-span-4 border-t border-paper-line px-4 py-2 font-data text-[10px] uppercase tracking-wider text-paper-ink-faint hover:text-bronze-text transition-colors"
      >
        Illustrative pool figures — see the live session on /pool →
      </Link>
    </div>
  );
}
