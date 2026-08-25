import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AgentTable } from "@/components/AgentTable";
import { MarketHero } from "@/components/MarketHero";
import { StatStrip } from "@/components/StatStrip";
import { CatalogOverview } from "@/components/CatalogOverview";
import { MiniStats } from "@/components/MiniStats";
import { Territories } from "@/components/Territories";
import { HowItWorksMarquee } from "@/components/HowItWorksMarquee";
import { GuaranteeSteps } from "@/components/GuaranteeSteps";
import { AGENTS, isCategory } from "@/lib/agents";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const initialCategory = isCategory(params.category) ? params.category : "all";
  const initialQuery = params.q ?? "";

  return (
    <>
      <Header />
      <main>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-10">
          <MarketHero />
        </div>

        <StatStrip />

        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 sm:pt-12 pb-10">
          <CatalogOverview />
        </div>

        <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-10">
          <MiniStats />
        </div>

        <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-10">
          <span className="font-data text-xs uppercase tracking-wider text-bronze-text">
            Territories
          </span>
          <h2 className="font-display text-2xl sm:text-3xl mt-2 mb-8">
            Four kinds of work, equally underwritten.
          </h2>
          <Territories />
        </div>

        <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-16 sm:pb-24">
          <AgentTable agents={AGENTS} initialCategory={initialCategory} initialQuery={initialQuery} />
        </div>

        <HowItWorksMarquee />

        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <span className="font-data text-xs uppercase tracking-wider text-bronze-text block mb-2">
            The guarantee
          </span>
          <h2 className="font-display text-2xl sm:text-3xl mb-8">How every hire is backed.</h2>
          <GuaranteeSteps />
        </div>
      </main>
      <Footer />
    </>
  );
}
