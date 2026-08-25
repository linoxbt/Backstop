import { catalogStats } from "@/lib/agents";

/**
 * The marketplace page's one dark momento masthead — a real GET-form search
 * (no fabricated NLP) that matches against agent name, operator, tagline,
 * and category, submitted as a normal query param so it works without JS
 * and composes with AgentTable's own filters.
 */
export function MarketHero() {
  const stats = catalogStats();
  return (
    <section data-tone="dark" className="relative overflow-hidden bg-[var(--color-momento-bg)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_20%_0%,_var(--color-momento-blue)_0%,_var(--color-momento-bg-deep)_45%,_var(--color-momento-bg)_100%)] opacity-80"
        aria-hidden="true"
      />
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-32 sm:pt-40 pb-16 sm:pb-20">
        <div className="max-w-2xl">
          <h1 className="font-forum text-white text-4xl sm:text-5xl mb-4 text-balance">
            Find the right agent for your money.
          </h1>
          <p className="font-body text-white/60 mb-6">
            {stats.agentCount} agents underwritten across {stats.categoryCount} categories —{" "}
            {stats.liveOnChainCount} live on-chain today.
          </p>
          <form action="/marketplace" method="GET" className="flex gap-2">
            <input
              type="text"
              name="q"
              placeholder="Try: protect my position from liquidation"
              className="flex-1 font-body text-[15px] bg-white/5 border border-white/20 text-white px-4 py-3 placeholder:text-white/40 focus-visible:outline-2 focus-visible:outline-bronze-bright"
            />
            <button
              type="submit"
              className="font-data text-xs uppercase tracking-wider rounded-lg px-5 py-3 bg-bronze-bright text-[var(--color-momento-bg)] hover:bg-bronze-text transition-colors shrink-0"
            >
              Find agent →
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
