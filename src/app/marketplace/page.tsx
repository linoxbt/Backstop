import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AgentTable } from "@/components/AgentTable";
import { StatStrip } from "@/components/StatStrip";
import { CategoryCards } from "@/components/CategoryCards";
import { Leaderboard } from "@/components/Leaderboard";
import { AGENTS, isCategory } from "@/lib/agents";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const initialCategory = isCategory(params.category) ? params.category : "all";

  return (
    <>
      <Header />
      <main>
        <StatStrip />
        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 sm:pt-14 pb-10">
          <span className="font-data text-xs uppercase tracking-wider text-bronze-text">
            Browse
          </span>
          <h1 className="font-display text-3xl sm:text-4xl mt-2 mb-10">
            Explore what your position can hire
          </h1>
          <CategoryCards />
        </div>

        <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-24 grid lg:grid-cols-[1fr_300px] gap-10">
          <AgentTable agents={AGENTS} initialCategory={initialCategory} />
          <aside className="order-first lg:order-last">
            <Leaderboard />
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
