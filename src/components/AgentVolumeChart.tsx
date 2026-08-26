import type { AgentVolumeEntry } from "@/lib/chain/hires";
import { getAgent } from "@/lib/agents";

/**
 * Real payment volume received per agent (from actual `hires` rows, mode
 * "live" only) as a single-hue horizontal bar chart — one measure across
 * many entities, so one consistent hue throughout rather than a categorical
 * palette (see the dataviz skill's color-formula: sequential/single-measure
 * comparisons get one hue, categorical color is for distinguishing series,
 * not categories being ranked by the same measure). Paired with two
 * separate stat tiles rather than crammed onto the same axis, since hires
 * count and cycles-completed are different units from a currency volume —
 * never a dual-axis chart.
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

  return (
    <div className="border border-paper-line bg-paper-raised/40 p-5 sm:p-7">
      <div className="grid sm:grid-cols-3 gap-6 mb-8 pb-6 border-b border-paper-line">
        <ChartStat label="Total real volume" value={`${totalRealVolume.toLocaleString()} U`} />
        <ChartStat label="Total real hires" value={String(totalRealHires)} />
        <ChartStat
          label="Cycles completed"
          value={totalCyclesCompleted.toLocaleString()}
          note="Illustrative catalog field, summed across all 13 agents"
        />
      </div>

      <span className="font-data text-[11px] uppercase tracking-wider text-paper-ink-faint block mb-4">
        Real payment volume by agent
      </span>

      {rows.length === 0 ? (
        <p className="text-[13px] text-paper-ink-soft leading-relaxed max-w-md">
          No real hires recorded yet — this chart plots real payment volume the moment the
          first one lands, not a placeholder.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.agentId} title={`${row.agent!.name}: ${row.realVolume.toLocaleString()} U across ${row.realHireCount} hire${row.realHireCount === 1 ? "" : "s"}`}>
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="font-ui text-[13px]">{row.agent!.name}</span>
                <span className="font-data text-[12px] text-paper-ink-faint tabnum">
                  {row.realVolume.toLocaleString()} U · {row.realHireCount} hire
                  {row.realHireCount === 1 ? "" : "s"}
                </span>
              </div>
              <div className="h-2 bg-paper-line rounded-full overflow-hidden">
                <div
                  className="h-full bg-bronze-bright rounded-full"
                  style={{ width: `${(row.realVolume / maxVolume) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChartStat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div>
      <span className="text-paper-ink-faint text-[10px] uppercase tracking-wider mb-1 block">{label}</span>
      <span className="font-data text-2xl tabnum block">{value}</span>
      {note && <span className="text-[11px] text-paper-ink-faint block mt-1">{note}</span>}
    </div>
  );
}
