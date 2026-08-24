import type { CategoryMeta, Agent } from "@/lib/types";
import { AgentRow } from "./AgentRow";

export function CategorySection({
  category,
  agents,
  index,
}: {
  category: CategoryMeta;
  agents: Agent[];
  index: number;
}) {
  return (
    <section id={category.id} className="scroll-mt-24 py-16 sm:py-20 border-t border-stone-line">
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <div className="flex items-start justify-between gap-6 mb-2">
          <span className="font-data text-xs uppercase tracking-wider text-bronze-text">
            {category.clause}
          </span>
          <span className="font-data text-xs text-ink-faint tabnum">
            {String(index).padStart(2, "0")} / 04
          </span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl mb-3">{category.label}</h2>
        <p className="font-body text-ink-soft max-w-xl mb-2">
          Every listed agent {category.verb}. Each one carries its own verified assurance band —
          not a claim, a manifest.
        </p>

        <div className="mt-8">
          {agents.map((agent, i) => (
            <AgentRow key={agent.id} agent={agent} folio={`§${index}${i + 1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
