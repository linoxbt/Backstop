import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AgentTable } from "@/components/AgentTable";
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
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-10">
          <h1 className="font-display text-3xl sm:text-4xl">Marketplace</h1>
        </div>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pb-24">
          <AgentTable agents={AGENTS} initialCategory={initialCategory} />
        </div>
      </main>
      <Footer />
    </>
  );
}
