import { AGENTS, catalogStats } from "@/lib/agents";

/**
 * Dense ticker strip in Agentic Market's position — a leading real
 * aggregate stat plus a scrolling row of real per-agent pills (name,
 * category, network, fee). Deliberately not a fabricated live transaction
 * feed: Backstop has no payment-volume tracking to show honestly as "live."
 */
export function StatStrip() {
  const stats = catalogStats();
  return (
    <div className="bg-paper-raised border-b border-paper-line">
      <div className="max-w-6xl mx-auto flex items-stretch font-data text-[11px] uppercase tracking-wider overflow-x-auto">
        <div className="shrink-0 px-5 sm:px-8 py-3 border-r border-paper-line">
          <span className="block text-paper-ink-faint text-[9px]">Agents underwritten</span>
          <span className="text-bronze-text text-base tabnum">{stats.agentCount}</span>
        </div>
        <div className="flex items-center gap-6 px-5 whitespace-nowrap">
          {AGENTS.map((a) => (
            <span key={a.id} className="flex items-baseline gap-2 shrink-0">
              <span className="text-paper-ink">{a.name}</span>
              <span className="text-paper-ink-faint">{a.feeModel.split(",")[0]}</span>
              <span className="text-paper-ink-faint">{a.network}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
