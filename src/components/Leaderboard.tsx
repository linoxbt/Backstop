import Link from "next/link";
import { AGENTS, CATEGORIES } from "@/lib/agents";

const RANKED = [...AGENTS].sort((a, b) => b.hirers - a.hirers).slice(0, 9);

/** Top agents by hirers, Agentic Market's leaderboard-sidebar position. */
export function Leaderboard() {
  return (
    <div className="border border-paper-line bg-paper-raised/50">
      <div className="px-4 py-3 border-b border-paper-line">
        <span className="font-data text-[11px] uppercase tracking-wider text-bronze-text">
          Leaderboard — by hirers
        </span>
      </div>
      <ol>
        {RANKED.map((agent, i) => {
          const category = CATEGORIES.find((c) => c.id === agent.category);
          const isNew = agent.cyclesCompleted === 0;
          return (
            <li key={agent.id} className="border-b border-paper-line last:border-b-0">
              <Link
                href={`/agents/${agent.id}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-paper-raised transition-colors"
              >
                <span className="font-data text-[11px] text-paper-ink-faint tabnum w-4 shrink-0">
                  {i + 1}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="font-ui text-[13px] truncate">{agent.name}</span>
                    {agent.providerAddress && (
                      <span className="text-verdigris text-[11px]" title="Real on-chain identity">
                        ✓
                      </span>
                    )}
                    {isNew && (
                      <span className="font-data text-[9px] uppercase tracking-wider text-stamp border border-stamp/50 px-1 py-px shrink-0">
                        New
                      </span>
                    )}
                  </span>
                  <span className="font-data text-[10px] uppercase tracking-wider text-paper-ink-faint">
                    {category?.label}
                  </span>
                </span>
                <span className="font-data text-[11px] text-paper-ink-soft tabnum shrink-0">
                  {agent.hirers}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
