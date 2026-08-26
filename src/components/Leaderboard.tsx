import Link from "next/link";
import { AGENTS, CATEGORIES } from "@/lib/agents";
import type { AgentVolumeEntry } from "@/lib/chain/hires";

/**
 * Ranked by real hire count (from the `hires` table, mode "live" only) --
 * not the static, illustrative `hirers` field the catalog also carries.
 * Every catalog agent underlying this leaderboard has a real onchain
 * `providerAddress`, so a real hire against any of them opens a real
 * ERC-8183 job; this ranks who's actually been hired the most, honestly
 * zero for one that hasn't yet rather than a fabricated placeholder.
 */
export function Leaderboard({ volumeByAgent }: { volumeByAgent: AgentVolumeEntry[] }) {
  const hireCountByAgent = new Map(volumeByAgent.map((v) => [v.agentId, v.realHireCount]));
  const ranked = [...AGENTS]
    .map((agent) => ({ agent, realHireCount: hireCountByAgent.get(agent.id) ?? 0 }))
    .sort((a, b) => b.realHireCount - a.realHireCount);

  return (
    <div className="border border-paper-line bg-paper-raised/50">
      <div className="px-4 py-3 border-b border-paper-line">
        <span className="font-data text-[11px] uppercase tracking-wider text-bronze-text">
          Leaderboard, by real hires
        </span>
      </div>
      <ol>
        {ranked.map(({ agent, realHireCount }, i) => {
          const category = CATEGORIES.find((c) => c.id === agent.category);
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
                    <span className="text-verdigris text-[11px]" title="Real onchain identity">
                      ✓
                    </span>
                    {realHireCount === 0 && (
                      <span className="font-data text-[9px] uppercase tracking-wider text-stamp border border-stamp/50 px-1 py-px shrink-0">
                        No hires yet
                      </span>
                    )}
                  </span>
                  <span className="font-data text-[10px] uppercase tracking-wider text-paper-ink-faint">
                    {category?.label}
                  </span>
                </span>
                <span className="font-data text-[11px] text-paper-ink-soft tabnum shrink-0">
                  {realHireCount}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
