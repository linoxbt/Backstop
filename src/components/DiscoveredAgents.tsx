import type { DiscoveredAgentsPage } from "@/lib/erc8004";

/**
 * Real agents discovered directly from the ERC-8004 registry via 8004scan,
 * not Backstop's own curated roster (src/lib/agents.ts). No fee
 * relationship, no assurance band, no hire flow here on purpose: Backstop
 * has no real data of its own about these agents beyond the identity and
 * reputation the registry itself publishes, so that's all this shows.
 * Every card links out to the agent's own real page on 8004scan.io.
 */
export function DiscoveredAgents({ page }: { page: DiscoveredAgentsPage }) {
  if (page.agents.length === 0) {
    return (
      <p className="text-[13px] text-paper-ink-soft leading-relaxed max-w-md">
        Couldn&rsquo;t reach the ERC-8004 registry just now, so there&rsquo;s nothing to show here
        this load. This section always reflects the real, live registry, never a cached or
        invented list.
      </p>
    );
  }

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {page.agents.map((agent) => (
          <a
            key={agent.agentId}
            href={`https://www.8004scan.io/agent/${agent.agentId}`}
            target="_blank"
            rel="noreferrer"
            className="border border-paper-line bg-paper-raised/40 p-5 hover:border-bronze-text transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="font-display text-lg truncate">{agent.name}</span>
              {agent.isVerified && (
                <span className="text-verdigris text-[11px] shrink-0" title="Verified on ERC-8004">
                  ✓
                </span>
              )}
            </div>
            {agent.description && (
              <p className="text-[12px] text-paper-ink-soft leading-relaxed mb-3 line-clamp-2">
                {agent.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-data text-[10px] uppercase tracking-wider text-paper-ink-faint">
              <span>{agent.ownerLabel ?? `${agent.ownerAddress.slice(0, 6)}…${agent.ownerAddress.slice(-4)}`}</span>
              {agent.supportedProtocols.map((p) => (
                <span key={p} className="px-1.5 py-0.5 border border-paper-line">
                  {p}
                </span>
              ))}
              {agent.x402Supported && <span className="px-1.5 py-0.5 border border-paper-line">x402</span>}
              {agent.totalScore > 0 && <span className="tabnum">★ {agent.totalScore.toFixed(1)}</span>}
            </div>
          </a>
        ))}
      </div>
      <a
        href="https://www.8004scan.io/agents?chain=97"
        target="_blank"
        rel="noreferrer"
        className="font-data text-xs uppercase tracking-wider text-bronze-text hover:text-bronze-bright transition-colors"
      >
        Browse all {page.total.toLocaleString()} registered agents on 8004scan →
      </a>
    </div>
  );
}
