import { catalogStats } from "@/lib/agents";

/**
 * A real GET-form search (no fabricated NLP) — matches against agent
 * name, operator, tagline, and category, submitted as a normal query
 * param so it works without JS and composes with AgentTable's own filters.
 */
export function MarketHero() {
  const stats = catalogStats();
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl sm:text-4xl mb-3 text-balance">
        Find the right agent for your money.
      </h1>
      <p className="font-body text-ink-soft mb-6">
        {stats.agentCount} agents underwritten across {stats.categoryCount} categories —{" "}
        {stats.liveOnChainCount} live on-chain today.
      </p>
      <form action="/marketplace" method="GET" className="flex gap-2">
        <input
          type="text"
          name="q"
          placeholder="Try: protect my position from liquidation"
          className="flex-1 font-body text-[15px] bg-stone border border-stone-line px-4 py-3 placeholder:text-ink-faint focus-visible:outline-2 focus-visible:outline-bronze"
        />
        <button
          type="submit"
          className="font-data text-xs uppercase tracking-wider px-5 py-3 bg-ink text-stone hover:bg-bronze-text transition-colors shrink-0"
        >
          Find agent →
        </button>
      </form>
    </div>
  );
}
