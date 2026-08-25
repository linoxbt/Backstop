import Link from "next/link";
import { CATEGORIES, agentsByCategory } from "@/lib/agents";

/** Browse-by-category cards, Agentic Market's bundle-row position — real categories, not invented bundles. */
export function CategoryCards() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {CATEGORIES.map((c) => (
        <Link
          key={c.id}
          href={`/marketplace?category=${c.id}`}
          className="group border border-stone-line bg-stone-raised/50 p-5 flex flex-col hover:border-bronze-text transition-colors"
        >
          <span className="font-data text-[10px] uppercase tracking-wider text-bronze-text mb-2">
            {c.clause}
          </span>
          <h3 className="font-display text-lg mb-2 group-hover:text-bronze-text transition-colors">
            {c.label}
          </h3>
          <p className="font-body text-[13px] text-ink-soft leading-relaxed mb-4 flex-1">
            {c.blurb}
          </p>
          <span className="font-data text-[11px] uppercase tracking-wider text-ink-faint">
            {agentsByCategory(c.id).length} agents →
          </span>
        </Link>
      ))}
    </div>
  );
}
