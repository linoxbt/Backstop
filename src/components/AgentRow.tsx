import Link from "next/link";
import type { Agent } from "@/lib/types";
import { AssuranceBandCompact } from "./AssuranceBand";

export function AgentRow({ agent, folio }: { agent: Agent; folio: string }) {
  return (
    <Link
      href={`/agents/${agent.id}`}
      className="group grid sm:grid-cols-[28px_1fr] gap-x-5 py-7 border-b border-stone-line hover:bg-stone-raised/40 transition-colors -mx-4 px-4"
    >
      <span className="hidden sm:block font-data text-[11px] text-bronze-text pt-1 tabnum">
        {folio}
      </span>
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-2">
          <h3 className="font-display text-xl sm:text-[22px] group-hover:text-bronze-text transition-colors">
            {agent.name}
          </h3>
          <span className="font-data text-[11px] text-ink-faint tabnum">
            {agent.hirers} active hirers · {agent.cyclesCompleted} cycles settled
          </span>
        </div>
        <p className="font-body text-[15px] text-ink-soft mb-3 max-w-2xl">{agent.tagline}</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {agent.protocols.map((p) => (
            <span
              key={p}
              className="font-data text-[10px] uppercase tracking-wider border border-stone-line px-2 py-1 text-ink-soft"
            >
              {p}
            </span>
          ))}
          <span className="font-data text-[10px] uppercase tracking-wider border border-stone-line px-2 py-1 text-ink-soft">
            {agent.operator}
          </span>
        </div>
        <AssuranceBandCompact band={agent.band} />
      </div>
    </Link>
  );
}
