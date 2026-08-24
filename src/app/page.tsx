import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WayfindingDiagram } from "@/components/WayfindingDiagram";
import { CategorySection } from "@/components/CategorySection";
import { CATEGORIES, agentsByCategory } from "@/lib/agents";
import { POOL } from "@/lib/pool";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="max-w-4xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-14 sm:pb-20 text-center">
          <span className="font-data text-xs uppercase tracking-[0.2em] text-bronze-text">
            BNB Agent Studio Marketplace
          </span>
          <h1 className="font-display text-[34px] sm:text-5xl leading-[1.08] mt-5 mb-6 text-balance">
            Hire an autonomous agent. If it misses, the pool pays you back.
          </h1>
          <p className="font-body text-lg text-ink-soft max-w-2xl mx-auto leading-relaxed">
            Backstop lists rebalancing, grid trading, yield and health-factor agents live on BSC.
            Every one carries a verified assurance band &mdash; its historical range, what it
            promised you, and what actually happened &mdash; enforced by a shared reserve that
            pays out automatically the moment it misses.
          </p>
        </section>

        <section className="px-5 sm:px-8 pb-20 sm:pb-28">
          <WayfindingDiagram />
          <p className="text-center font-data text-[11px] text-ink-faint mt-6 tabnum">
            {POOL.tvl} in reserve · {POOL.payoutRatio} paid out, trailing 90 days ·{" "}
            {POOL.totalRebatesCount} rebates issued
          </p>
        </section>

        {CATEGORIES.map((category, i) => (
          <CategorySection
            key={category.id}
            category={category}
            agents={agentsByCategory(category.id)}
            index={i + 1}
          />
        ))}
      </main>
      <Footer />
    </>
  );
}
