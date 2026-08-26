import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GuaranteeSteps } from "@/components/GuaranteeSteps";
import { SplashIntro } from "@/components/landing/SplashIntro";
import { MomentoHero } from "@/components/landing/MomentoHero";
import { GuaranteeReveal } from "@/components/landing/GuaranteeReveal";
import { AgentRail } from "@/components/landing/AgentRail";
import { CategoryShowcase } from "@/components/landing/CategoryShowcase";
import { POOL } from "@/lib/pool";
import { getTotalRebateStats } from "@/lib/chain/rebates";
import { getRealHireStatsForAllAgents } from "@/lib/chain/hires";
import { getPoolSessionInfo, getPoolBalance } from "@/lib/wallet/altanaPool";

// The closing stat bar below used to show POOL.tvl/payoutRatio/totalRebatesCount
// unconditionally, as if they were live facts rather than the static,
// illustrative figures in src/lib/pool.ts. Force-dynamic (matching /pool and
// /agents/[id]) plus the real reads below is what actually makes it honest.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [rebateTotals, volumeByAgent, session] = await Promise.all([
    getTotalRebateStats(),
    getRealHireStatsForAllAgents(),
    getPoolSessionInfo(),
  ]);
  const poolBalance =
    session.configured && session.walletAddress
      ? await getPoolBalance(session.walletAddress as `0x${string}`)
      : null;
  const totalRealVolume = volumeByAgent.reduce((sum, v) => sum + v.realVolume, 0);
  const realPayoutRatio = totalRealVolume > 0 ? (rebateTotals.totalAmount / totalRealVolume) * 100 : null;

  return (
    <>
      <SplashIntro />
      <Header />
      <main>
        <MomentoHero />
        <GuaranteeReveal />
        <AgentRail />
        <CategoryShowcase />

        <section data-tone="dark" className="bg-[var(--color-momento-bg-deep)]">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
            <div className="grid lg:grid-cols-[1fr_1.4fr] gap-x-12 gap-y-8 items-start">
              <div>
                <span className="font-data text-xs uppercase tracking-wider text-bronze-bright block mb-2">
                  The guarantee
                </span>
                <h2 className="font-forum text-white text-2xl sm:text-3xl max-w-xs">
                  Three steps, enforced onchain.
                </h2>
              </div>
              <GuaranteeSteps tone="dark" />
            </div>
          </div>
        </section>

        <section className="border-t border-paper-line">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6 flex flex-wrap gap-x-8 gap-y-2 font-data text-[12px] text-paper-ink-faint tabnum">
            <span>
              {poolBalance ? `${Number(poolBalance.formatted).toLocaleString()} ${poolBalance.symbol}` : POOL.tvl} in
              reserve{!poolBalance && " (illustrative)"}
            </span>
            <span>·</span>
            <span>
              {realPayoutRatio !== null ? `${realPayoutRatio.toFixed(1)}%` : POOL.payoutRatio} paid out
              {realPayoutRatio !== null ? ", real" : ", trailing 90d (illustrative)"}
            </span>
            <span>·</span>
            <span>{rebateTotals.count} real rebates issued</span>
          </div>
        </section>

        <section data-tone="dark" className="bg-[var(--color-momento-bg)]">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20 flex flex-wrap items-center justify-between gap-6">
            <h2 className="font-forum text-white text-2xl sm:text-3xl max-w-md">
              Four categories, one reserve. Go hire something.
            </h2>
            <Link
              href="/marketplace"
              className="font-data text-xs uppercase tracking-wider rounded-lg px-5 py-3 bg-bronze-bright text-[var(--color-momento-bg)] hover:bg-bronze-text transition-colors shrink-0"
            >
              Enter the marketplace →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
