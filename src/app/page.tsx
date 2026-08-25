import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WayfindingDiagram } from "@/components/WayfindingDiagram";
import { GuaranteeSteps } from "@/components/GuaranteeSteps";
import { SplashIntro } from "@/components/landing/SplashIntro";
import { MomentoHero } from "@/components/landing/MomentoHero";
import { GuaranteeReveal } from "@/components/landing/GuaranteeReveal";
import { AgentRail } from "@/components/landing/AgentRail";
import { AGENTS } from "@/lib/agents";
import { POOL } from "@/lib/pool";

export default function Home() {
  const liveAgents = AGENTS.filter((a) => a.providerAddress);

  return (
    <>
      <SplashIntro />
      <Header />
      <main>
        <MomentoHero />
        <GuaranteeReveal />
        <AgentRail />

        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24 border-t border-paper-line">
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

        <section className="border-t border-paper-line">
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

        <section className="border-t border-paper-line">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
            <div className="grid lg:grid-cols-[1fr_1.4fr] gap-x-12 gap-y-8 items-start">
              <div>
                <span className="font-data text-xs uppercase tracking-wider text-bronze-text block mb-2">
                  BNB Agent Studio
                </span>
                <h2 className="font-display text-2xl sm:text-3xl max-w-xs">
                  Live on BSC Testnet, right now.
                </h2>
                <p className="text-[13px] text-paper-ink-soft mt-4 max-w-xs">
                  Deployed via the <code className="font-data">bag</code> CLI this week —
                  real wallets, real Pieverse LLM keys.
                </p>
              </div>
              <div className="border-t border-paper-line">
                {liveAgents.map((a) => (
                  <div
                    key={a.id}
                    className="grid sm:grid-cols-[1fr_auto] gap-x-6 gap-y-1 py-4 border-b border-paper-line"
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
                      className="font-data text-[11px] text-paper-ink-faint hover:text-bronze-text transition-colors tabnum"
                    >
                      {a.providerAddress}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-paper-line">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6 flex flex-wrap gap-x-8 gap-y-2 font-data text-[12px] text-paper-ink-faint tabnum">
            <span>{POOL.tvl} in reserve</span>
            <span>·</span>
            <span>{POOL.payoutRatio} paid out, trailing 90d</span>
            <span>·</span>
            <span>{POOL.totalRebatesCount} rebates issued</span>
          </div>
        </section>

        <section className="border-t border-paper-line bg-paper-raised">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20 flex flex-wrap items-center justify-between gap-6">
            <h2 className="font-display text-2xl sm:text-3xl max-w-md">
              Four categories, one reserve. Go hire something.
            </h2>
            <Link
              href="/marketplace"
              className="font-data text-xs uppercase tracking-wider px-5 py-3 bg-paper-ink text-paper hover:bg-bronze-text transition-colors shrink-0"
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
