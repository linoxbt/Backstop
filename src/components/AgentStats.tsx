import type { Agent } from "@/lib/types";
import type { AgentHireStats } from "@/lib/chain/hires";

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div>
      <dt className="text-paper-ink-faint text-[10px] uppercase tracking-wider mb-1">{label}</dt>
      <dd className="font-data text-[15px] tabnum">{value}</dd>
      {note && <p className="text-[11px] text-paper-ink-faint mt-0.5">{note}</p>}
    </div>
  );
}

/**
 * Real hire/rebate aggregates for this specific agent (getRealHireStatsForAgent
 * — src/lib/chain/hires.ts), mixed with the agent's static catalog fields
 * only where those are honestly labeled as such. Never presents the static
 * `hirers`/`cyclesCompleted` fields as if they were the same kind of number
 * as the real hire count/volume next to them.
 */
export function AgentStats({ agent, stats }: { agent: Agent; stats: AgentHireStats }) {
  const avgPerHire = stats.realHireCount > 0 ? stats.realVolume / stats.realHireCount : null;

  return (
    <div className="border border-paper-line bg-paper-raised/40 p-5 sm:p-7">
      <div className="flex items-center justify-between gap-3 mb-5">
        <span className="font-data text-[11px] uppercase tracking-wider text-bronze-text">
          Agent record
        </span>
        <span className="font-data text-[10px] uppercase tracking-wider text-paper-ink-faint">
          {stats.realHireCount > 0 ? "Real hires below" : "No real hires recorded yet"}
        </span>
      </div>

      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5 mb-6">
        <Stat label="Real hires" value={String(stats.realHireCount)} />
        <Stat label="Real volume" value={`${stats.realVolume.toLocaleString()} U`} />
        <Stat
          label="Avg / hire"
          value={avgPerHire !== null ? `${avgPerHire.toLocaleString(undefined, { maximumFractionDigits: 0 })} U` : "N/A"}
        />
        <Stat
          label="Missed & refunded"
          value={stats.realRebateCount > 0 ? `${stats.realRebateCount}` : "0"}
          note={stats.realRefunded > 0 ? `${stats.realRefunded.toLocaleString()} U refunded` : undefined}
        />
        <Stat label="Charges" value={agent.feeModel} />
        <Stat label="Cycles completed" value={String(agent.cyclesCompleted)} note="Illustrative catalog field" />
      </dl>

      <div className="pt-4 border-t border-paper-line">
        <span className="text-paper-ink-faint text-[10px] uppercase tracking-wider mb-2 block">
          Access surfaces
        </span>
        {agent.endpoints ? (
          <div className="flex flex-wrap gap-x-5 gap-y-1 font-data text-[12px]">
            <EndpointBadge label="A2A" enabled={agent.endpoints.a2a} />
            <EndpointBadge label="MCP" enabled={agent.endpoints.mcp} />
            <EndpointBadge label="x402" enabled={agent.endpoints.x402} />
          </div>
        ) : (
          <p className="text-[12px] text-paper-ink-faint">
            Illustrative listing: no deployed agent project to read a real protocol
            configuration from.
          </p>
        )}
      </div>
    </div>
  );
}

function EndpointBadge({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <span className={enabled ? "text-verdigris" : "text-paper-ink-faint"}>
      <span aria-hidden="true">{enabled ? "●" : "○"}</span> {label}
    </span>
  );
}
