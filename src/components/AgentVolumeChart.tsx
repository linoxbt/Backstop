import type { AgentVolumeEntry } from "@/lib/chain/hires";
import { getAgent, CATEGORIES } from "@/lib/agents";

// The exact same fixed category order and hues CatalogOverview.tsx already
// uses for its own category-composition bar, reused here rather than a
// second, disconnected categorical palette, so a category means the same
// color everywhere on the marketplace page.
const SHADE: Record<string, string> = {
  rebalancing: "bg-paper-ink",
  "grid-trading": "bg-bronze-text",
  yield: "bg-verdigris",
  "health-factor": "bg-paper-ink-soft",
};

/**
 * Real payment volume received per agent (from actual `hires` rows, mode
 * "live" only), color-coded by category (identity, one fixed hue per
 * category, never cycled) so the bar itself carries the same category
 * language as every other chart on this page, not an arbitrary single hue.
 * Paired with three stat tiles rather than crammed onto the same axis,
 * since hires count and cycles-completed are different units from a
 * currency volume, never a dual-axis chart.
 */
export function AgentVolumeChart({
  volumeByAgent,
  totalCyclesCompleted,
}: {
  volumeByAgent: AgentVolumeEntry[];
  totalCyclesCompleted: number;
}) {
  const totalRealHires = volumeByAgent.reduce((sum, v) => sum + v.realHireCount, 0);
  const totalRealVolume = volumeByAgent.reduce((sum, v) => sum + v.realVolume, 0);
  const rows = [...volumeByAgent]
    .sort((a, b) => b.realVolume - a.realVolume)
    .map((v) => ({ ...v, agent: getAgent(v.agentId) }))
    .filter((v) => v.agent);
  const maxVolume = Math.max(1, ...rows.map((r) => r.realVolume));
  const categoriesShown = [...new Set(rows.map((r) => r.agent!.category))];

  return (
    <div className="border border-paper-line bg-paper-raised/40">
      <div className="grid sm:grid-cols-3 gap-6 p-6 sm:p-8 border-b border-paper-line">
        <ChartStat label="Total real volume" value={`${totalRealVolume.toLocaleString()} U`} accent />
        <ChartStat label="Total real hires" value={String(totalRealHires)} />
        <ChartStat
          label="Cycles completed"
          value={totalCyclesCompleted.toLocaleString()}
          note="Illustrative catalog field, summed across all 13 agents"
        />
      </div>

      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <span className="font-data text-[11px] uppercase tracking-wider text-paper-ink-faint">
            Real payment volume by agent
          </span>
          {categoriesShown.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 font-data text-[10px] text-paper-ink-soft">
              {CATEGORIES.filter((c) => categoriesShown.includes(c.id)).map((c) => (
                <span key={c.id} className="flex items-center gap-1.5">
                  <i className={`inline-block w-2 h-2 rounded-full shrink-0 ${SHADE[c.id]}`} />
                  {c.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {rows.length === 0 ? (
          <div className="py-10 text-center">
            <p className="font-display text-2xl text-paper-ink-faint mb-2">No real volume yet</p>
            <p className="text-[13px] text-paper-ink-soft leading-relaxed max-w-md mx-auto">
              This chart plots real payment volume the moment the first real hire lands. Not a
              placeholder, not a projection.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map((row) => (
              <div
                key={row.agentId}
                title={`${row.agent!.name}: ${row.realVolume.toLocaleString()} U across ${row.realHireCount} hire${row.realHireCount === 1 ? "" : "s"}`}
              >
                <div className="flex items-baseline justify-between gap-3 mb-1.5">
                  <span className="font-ui text-[13px]">{row.agent!.name}</span>
                  <span className="font-data text-[12px] text-paper-ink-faint tabnum shrink-0">
                    {row.realVolume.toLocaleString()} U · {row.realHireCount} hire
                    {row.realHireCount === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="h-2.5 bg-paper-line rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-[width] duration-700 ease-out ${SHADE[row.agent!.category]}`}
                    style={{ width: `${Math.max(2, (row.realVolume / maxVolume) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChartStat({
  label,
  value,
  note,
  accent = false,
}: {
  label: string;
  value: string;
  note?: string;
  accent?: boolean;
}) {
  return (
    <div>
      <span className="text-paper-ink-faint text-[10px] uppercase tracking-wider mb-1.5 block">{label}</span>
      <span className={`font-display text-3xl tabnum block ${accent ? "text-bronze-text" : ""}`}>{value}</span>
      {note && <span className="text-[11px] text-paper-ink-faint block mt-1">{note}</span>}
    </div>
  );
}
