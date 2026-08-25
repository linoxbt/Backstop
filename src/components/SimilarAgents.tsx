import Link from "next/link";
import type { Agent } from "@/lib/types";
import { agentsByCategory } from "@/lib/agents";

export function SimilarAgents({ agent }: { agent: Agent }) {
  const similar = agentsByCategory(agent.category)
    .filter((a) => a.id !== agent.id)
    .slice(0, 3);
  if (similar.length === 0) return null;

  return (
    <div>
      <span className="font-data text-[11px] uppercase tracking-wider text-bronze-text block mb-4">
        Similar agents
      </span>
      <div className="grid sm:grid-cols-3 gap-4">
        {similar.map((a) => (
          <Link
            key={a.id}
            href={`/agents/${a.id}`}
            className="group border border-paper-line bg-paper-raised/50 p-4 hover:border-bronze-text transition-colors"
          >
            <span className="font-display text-base group-hover:text-bronze-text transition-colors block mb-1">
              {a.name}
            </span>
            <span className="font-data text-[10px] uppercase tracking-wider text-paper-ink-faint block mb-3">
              {a.operator}
            </span>
            <span className="font-data text-[11px] text-paper-ink-soft tabnum">
              {a.hirers} hirers · {a.cyclesCompleted} cycles
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
