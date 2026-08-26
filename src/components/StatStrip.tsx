import { AGENTS, catalogStats } from "@/lib/agents";

/**
 * Dense ticker strip in Agentic Market's position, a leading real aggregate
 * stat plus a continuously moving row of real per-agent pills (name,
 * category, network, fee). Reuses the same `.animate-marquee` keyframe
 * HowItWorksMarquee.tsx already established (duplicate the track, translate
 * exactly -50% so it loops seamlessly) rather than a second bespoke
 * animation mechanism; respects prefers-reduced-motion automatically via
 * that same global override. Deliberately not a fabricated live transaction
 * feed: Backstop has no payment-volume tracking to show honestly as "live"
 * here (see AgentVolumeChart for where real volume actually is shown).
 */
export function StatStrip() {
  const stats = catalogStats();
  const pills = [...AGENTS, ...AGENTS];
  return (
    <div className="bg-paper-raised border-b border-paper-line overflow-hidden">
      <div className="max-w-6xl mx-auto flex items-stretch font-data text-[11px] uppercase tracking-wider">
        <div className="shrink-0 px-5 sm:px-8 py-3 border-r border-paper-line">
          <span className="block text-paper-ink-faint text-[9px]">Agents underwritten</span>
          <span className="text-bronze-text text-base tabnum">{stats.agentCount}</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex w-max animate-marquee py-3">
            {pills.map((a, i) => (
              <span
                key={`${a.id}-${i}`}
                className="flex items-baseline gap-2 shrink-0 px-5 border-r border-paper-line last:border-r-0"
                aria-hidden={i >= AGENTS.length}
              >
                <span className="text-paper-ink">{a.name}</span>
                <span className="text-paper-ink-faint">{a.feeModel.split(",")[0]}</span>
                <span className="text-paper-ink-faint">{a.network}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
