import { catalogStats } from "@/lib/agents";

/**
 * Dense stat strip in Agentic Market's ticker position — deliberately
 * showing real aggregate catalog numbers, not a fabricated live feed.
 * Backstop has no transaction-volume tracking to show honestly as "live."
 */
export function StatStrip() {
  const stats = catalogStats();
  return (
    <div className="bg-stone-raised border-b border-stone-line">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3 flex flex-wrap items-center gap-x-8 gap-y-2 font-data text-[11px] uppercase tracking-wider">
        <Stat label="Agents underwritten" value={stats.agentCount} />
        <Stat label="Categories" value={stats.categoryCount} />
        <Stat label="Live on-chain" value={stats.liveOnChainCount} accent />
        <Stat label="Hirers across catalog" value={stats.totalHirers} />
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <span className="flex items-baseline gap-2">
      <span className={`tabnum ${accent ? "text-verdigris" : "text-bronze-text"}`}>{value}</span>
      <span className="text-ink-faint">{label}</span>
    </span>
  );
}
