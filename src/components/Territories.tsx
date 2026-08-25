import Link from "next/link";
import type { AgentCategory } from "@/lib/types";
import { CATEGORIES, agentsByCategory } from "@/lib/agents";
import { CategorySeal } from "@/components/landing/CategorySeal";

const TERRITORY: Record<AgentCategory, { word: string }> = {
  "health-factor": { word: "Protect" },
  yield: { word: "Grow" },
  rebalancing: { word: "Automate" },
  "grid-trading": { word: "Trade" },
};

/**
 * The four categories as equally-deep territories rather than generic
 * browse cards — each with real per-category stats (live agent count,
 * combined hirers, the top agent by hirers), not invented ones.
 */
export function Territories() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {CATEGORIES.map((c) => {
        const agents = agentsByCategory(c.id);
        const territory = TERRITORY[c.id];
        const combinedHirers = agents.reduce((sum, a) => sum + a.hirers, 0);
        const liveCount = agents.filter((a) => a.providerAddress).length;
        const top = [...agents].sort((a, b) => b.hirers - a.hirers)[0];

        return (
          <Link
            key={c.id}
            href={`/marketplace?category=${c.id}`}
            className="group border border-paper-line bg-paper-raised/50 p-5 sm:p-6 hover:border-bronze-text transition-colors"
          >
            <div className="flex items-center gap-3 mb-1">
              {top && <CategorySeal band={top.band} size={40} />}
              <span className="font-data text-xs uppercase tracking-[0.2em] text-bronze-text">
                {territory.word}
              </span>
            </div>
            <h3 className="font-display text-xl mb-2 group-hover:text-bronze-text transition-colors">
              {c.label}
            </h3>
            <p className="font-body text-[13px] text-paper-ink-soft leading-relaxed mb-4">{c.blurb}</p>

            <div className="grid grid-cols-3 gap-3 font-data text-[11px] border-t border-paper-line pt-3">
              <div>
                <span className="block text-paper-ink-faint text-[9px] uppercase tracking-wider">
                  Agents
                </span>
                <span className="tabnum">
                  {agents.length}
                  {liveCount > 0 && <span className="text-verdigris"> · {liveCount} live</span>}
                </span>
              </div>
              <div>
                <span className="block text-paper-ink-faint text-[9px] uppercase tracking-wider">
                  Hirers
                </span>
                <span className="tabnum">{combinedHirers}</span>
              </div>
              <div className="truncate">
                <span className="block text-paper-ink-faint text-[9px] uppercase tracking-wider">
                  Top agent
                </span>
                <span className="truncate block">{top?.name ?? "—"}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
