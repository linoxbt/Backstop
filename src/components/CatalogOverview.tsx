import { AGENTS, CATEGORIES, catalogStats } from "@/lib/agents";
import { Leaderboard } from "./Leaderboard";

const SHADE = ["bg-paper-ink", "bg-bronze-text", "bg-verdigris", "bg-paper-ink-soft"];

/**
 * Agentic Market's "big number + chart + leaderboard" block — real
 * aggregate numbers and a real category-composition bar (agent counts per
 * category), not a fabricated transaction time series Backstop has no
 * data to plot honestly.
 */
export function CatalogOverview() {
  const stats = catalogStats();
  const total = AGENTS.length;

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-10">
      <div>
        <span className="font-data text-[11px] uppercase tracking-wider text-paper-ink-faint">
          Hirers across the catalog
        </span>
        <div className="font-display text-4xl sm:text-5xl mt-1 mb-6 tabnum">
          {stats.totalHirers.toLocaleString()}
        </div>

        <div className="flex h-3 w-full overflow-hidden border border-paper-line">
          {CATEGORIES.map((c, i) => {
            const count = AGENTS.filter((a) => a.category === c.id).length;
            return (
              <div
                key={c.id}
                className={SHADE[i % SHADE.length]}
                style={{ width: `${(count / total) * 100}%` }}
                title={`${c.label}: ${count} agents`}
              />
            );
          })}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 font-data text-[11px] text-paper-ink-soft">
          {CATEGORIES.map((c, i) => {
            const count = AGENTS.filter((a) => a.category === c.id).length;
            return (
              <span key={c.id} className="flex items-center gap-1.5">
                <i className={`inline-block w-2.5 h-2.5 shrink-0 ${SHADE[i % SHADE.length]}`} />
                {c.label} · {count}
              </span>
            );
          })}
        </div>
      </div>
      <Leaderboard />
    </div>
  );
}
