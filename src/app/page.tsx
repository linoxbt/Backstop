import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WayfindingDiagram } from "@/components/WayfindingDiagram";
import { AssuranceBandInteractive } from "@/components/AssuranceBandInteractive";
import { GuaranteeSteps } from "@/components/GuaranteeSteps";
import { AGENTS, getAgent } from "@/lib/agents";
import { POOL } from "@/lib/pool";

export default function Home() {
  const flagship = getAgent("tideline-grid")!;
  const liveAgents = AGENTS.filter((a) => a.providerAddress);

  return (
    <>
      <Header />
      <main>
        <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-16 sm:pb-24">
          <div className="grid lg:grid-cols-[1.3fr_1fr] gap-x-12 gap-y-10 items-start">
            <div>
              <span className="font-data text-xs uppercase tracking-[0.2em] text-bronze-text">
                BNB Agent Studio Marketplace
              </span>
              <h1 className="font-display text-[36px] sm:text-[52px] leading-[1.05] mt-5 mb-6 text-balance max-w-xl">
                Hire an agent.
                <br />
                If it misses, the pool pays you back.
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/marketplace"
                  className="font-data text-xs uppercase tracking-wider px-5 py-3 bg-ink text-stone hover:bg-bronze-text transition-colors"
                >
                  Enter the marketplace →
                </Link>
                <Link
                  href="/docs"
                  className="font-data text-xs uppercase tracking-wider px-5 py-3 border border-ink text-ink hover:bg-ink hover:text-stone transition-colors"
                >
                  Read the docs
                </Link>
              </div>
            </div>

            <div className="lg:mt-10">
              <span className="font-data text-[11px] uppercase tracking-wider text-ink-faint block mb-2">
                Live — {flagship.name}
              </span>
              <AssuranceBandInteractive band={flagship.band} agentName={flagship.name} />
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-16 sm:pb-24">
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-x-12 gap-y-8 items-start">
            <div>
              <span className="font-data text-xs uppercase tracking-wider text-bronze-text block mb-2">
                Four categories
              </span>
              <h2 className="font-display text-2xl sm:text-3xl max-w-xs">
                One reserve standing behind all of them.
              </h2>
            </div>
            <WayfindingDiagram />
          </div>
        </section>

        <section className="border-t border-stone-line">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
            <div className="grid lg:grid-cols-[1fr_1.4fr] gap-x-12 gap-y-8 items-start">
              <div>
                <span className="font-data text-xs uppercase tracking-wider text-bronze-text block mb-2">
                  The guarantee
                </span>
                <h2 className="font-display text-2xl sm:text-3xl max-w-xs">
                  Three steps, enforced on-chain.
                </h2>
              </div>
              <GuaranteeSteps />
            </div>
          </div>
        </section>

        <section className="border-t border-stone-line">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
            <div className="grid lg:grid-cols-[1fr_1.4fr] gap-x-12 gap-y-8 items-start">
              <div>
                <span className="font-data text-xs uppercase tracking-wider text-bronze-text block mb-2">
                  BNB Agent Studio
                </span>
                <h2 className="font-display text-2xl sm:text-3xl max-w-xs">
                  Live on BSC Testnet, right now.
                </h2>
                <p className="text-[13px] text-ink-soft mt-4 max-w-xs">
                  Deployed via the <code className="font-data">bag</code> CLI this week —
                  real wallets, real Pieverse LLM keys.
                </p>
              </div>
              <div className="border-t border-stone-line">
                {liveAgents.map((a) => (
                  <div
                    key={a.id}
                    className="grid sm:grid-cols-[1fr_auto] gap-x-6 gap-y-1 py-4 border-b border-stone-line"
                  >
                    <Link
                      href={`/agents/${a.id}`}
                      className="font-display text-lg hover:text-bronze-text transition-colors"
                    >
                      {a.name}
                    </Link>
                    <a
                      href={`https://testnet.bscscan.com/address/${a.providerAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-data text-[11px] text-ink-faint hover:text-bronze-text transition-colors tabnum"
                    >
                      {a.providerAddress}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-stone-line">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6 flex flex-wrap gap-x-8 gap-y-2 font-data text-[12px] text-ink-faint tabnum">
            <span>{POOL.tvl} in reserve</span>
            <span>·</span>
            <span>{POOL.payoutRatio} paid out, trailing 90d</span>
            <span>·</span>
            <span>{POOL.totalRebatesCount} rebates issued</span>
          </div>
        </section>

        <section className="border-t border-stone-line bg-stone-raised">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20 flex flex-wrap items-center justify-between gap-6">
            <h2 className="font-display text-2xl sm:text-3xl max-w-md">
              Four categories, one reserve. Go hire something.
            </h2>
            <Link
              href="/marketplace"
              className="font-data text-xs uppercase tracking-wider px-5 py-3 bg-ink text-stone hover:bg-bronze-text transition-colors shrink-0"
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
