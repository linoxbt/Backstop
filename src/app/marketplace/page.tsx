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
import { AgentVolumeChart } from "@/components/AgentVolumeChart";
import { DiscoveredAgents } from "@/components/DiscoveredAgents";
import { AGENTS, isCategory } from "@/lib/agents";
import { getRealHireStatsForAllAgents } from "@/lib/chain/hires";
import { listRegisteredAgents, BSC_TESTNET_CHAIN_ID, BSC_MAINNET_CHAIN_ID } from "@/lib/erc8004";

// listRegisteredAgents hits the live ERC-8004 registry on every load (its
// own fetch already sets a 300s revalidate, so this doesn't mean a fresh
// network round-trip on every single request) -- the whole point of that
// section is that it's the real, current registry, not a snapshot frozen
// at build time.
export const dynamic = "force-dynamic";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const initialCategory = isCategory(params.category) ? params.category : "all";
  const initialQuery = params.q ?? "";
  const [volumeByAgent, discoveredTestnet, discoveredMainnet] = await Promise.all([
    getRealHireStatsForAllAgents(),
    listRegisteredAgents(12, BSC_TESTNET_CHAIN_ID),
    listRegisteredAgents(12, BSC_MAINNET_CHAIN_ID),
  ]);
  const totalCyclesCompleted = AGENTS.reduce((sum, a) => sum + a.cyclesCompleted, 0);

  return (
    <>
      <Header />
      <main>
        <MarketHero />

        <StatStrip />

        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 sm:pt-12 pb-10">
          <CatalogOverview />
        </div>

        <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-16">
          <AgentVolumeChart volumeByAgent={volumeByAgent} totalCyclesCompleted={totalCyclesCompleted} />
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

        <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-16 sm:pb-24 border-t border-paper-line pt-16">
          <span className="font-data text-xs uppercase tracking-wider text-bronze-text">
            Beyond the roster
          </span>
          <h2 className="font-display text-2xl sm:text-3xl mt-2 mb-2">
            Every agent registered on BNB Chain.
          </h2>
          <p className="font-body text-paper-ink-soft max-w-2xl mb-8">
            Real identities from the ERC-8004 registry, not Backstop&rsquo;s own roster above. No
            fee relationship or assurance band from Backstop for these, but every card here can
            still open a real, direct ERC-8183 hire against the agent&rsquo;s own onchain address.
          </p>
          <DiscoveredAgents testnet={discoveredTestnet} mainnet={discoveredMainnet} />
        </div>

        <HowItWorksMarquee />

        <div
          data-tone="dark"
          className="bg-[var(--color-momento-bg-deep)] py-16 sm:py-20"
        >
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <span className="font-data text-xs uppercase tracking-wider text-bronze-bright block mb-2">
              The guarantee
            </span>
            <h2 className="font-forum text-white text-2xl sm:text-3xl mb-8">
              How every hire is backed.
            </h2>
            <GuaranteeSteps tone="dark" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
