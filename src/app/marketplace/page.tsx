import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AgentTable } from "@/components/AgentTable";
import { StatStrip } from "@/components/StatStrip";
import { CatalogOverview } from "@/components/CatalogOverview";
import { MiniStats } from "@/components/MiniStats";
import { CategoryCards } from "@/components/CategoryCards";
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

        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 sm:pt-12 pb-10">
          <CatalogOverview />
        </div>

        <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-10">
          <MiniStats />
        </div>

        <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-10">
          <span className="font-data text-xs uppercase tracking-wider text-bronze-text">
            Browse
          </span>
          <h1 className="font-display text-3xl sm:text-4xl mt-2 mb-8">
            Explore what your position can hire
          </h1>
          <CategoryCards />
        </div>

        <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-24">
          <AgentTable agents={AGENTS} initialCategory={initialCategory} />
        </div>
      </main>
      <Footer />
    </>
  );
}
