import Link from "next/link";
import type { Agent } from "@/lib/types";
import { AssuranceBandCompact } from "./AssuranceBand";

export function AgentRow({
  agent,
  folio,
  selected,
  onToggleCompare,
}: {
  agent: Agent;
  folio: string;
  selected?: boolean;
  onToggleCompare?: (id: string) => void;
}) {
  const statLine =
    agent.cyclesCompleted === 0
      ? `${agent.hirers} hirer${agent.hirers === 1 ? "" : "s"} · just listed, cycle 1 in progress`
      : `${agent.hirers} active hirers · ${agent.cyclesCompleted} cycles settled`;

  return (
    <div className="flex items-stretch gap-3 -mx-4 px-4 border-b border-stone-line">
      {onToggleCompare && (
        <div className="flex items-start pt-6 shrink-0">
          <input
            type="checkbox"
            checked={!!selected}
            onChange={() => onToggleCompare(agent.id)}
            aria-label={`Compare ${agent.name}`}
            className="w-4 h-4 accent-bronze-text cursor-pointer"
          />
        </div>
      )}
      <Link
        href={`/agents/${agent.id}`}
        className="group grid sm:grid-cols-[24px_1fr] gap-x-4 py-5 flex-1 min-w-0 hover:bg-stone-raised/40 transition-colors"
      >
        <span className="hidden sm:block font-data text-[11px] text-bronze-text pt-0.5 tabnum">
          {folio}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 mb-1">
            <h3 className="font-display text-lg sm:text-xl group-hover:text-bronze-text transition-colors">
              {agent.name}
            </h3>
            <span className="font-data text-[11px] text-ink-faint tabnum">{statLine}</span>
          </div>
          <p className="font-body text-[14px] text-ink-soft mb-1.5">{agent.tagline}</p>
          <p className="font-data text-[10px] uppercase tracking-wider text-ink-faint mb-3">
            {agent.operator} · {agent.protocols.join(", ")}
          </p>
          <AssuranceBandCompact band={agent.band} />
        </div>
      </Link>
    </div>
  );
}
