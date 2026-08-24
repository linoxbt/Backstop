import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WayfindingDiagram } from "@/components/WayfindingDiagram";
import { AssuranceBandInteractive } from "@/components/AssuranceBandInteractive";
import { getAgent } from "@/lib/agents";
import { POOL } from "@/lib/pool";

export default function Home() {
  const flagship = getAgent("tideline-grid")!;

  return (
    <>
      <Header />
      <main>
        <section className="max-w-3xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-10 sm:pb-14 text-center">
          <span className="font-data text-xs uppercase tracking-[0.2em] text-bronze-text">
            BNB Agent Studio Marketplace
          </span>
          <h1 className="font-display text-[34px] sm:text-5xl leading-[1.08] mt-5 mb-5 text-balance">
            Hire an agent. If it misses, the pool pays you back.
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-3">
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
        </section>

        <section className="max-w-lg mx-auto px-5 sm:px-8 pb-16 sm:pb-20">
          <AssuranceBandInteractive band={flagship.band} agentName={flagship.name} />
        </section>

        <section className="px-5 sm:px-8 pb-16 sm:pb-20">
          <WayfindingDiagram />
        </section>

        <section className="border-t border-stone-line">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 py-8 flex flex-wrap justify-center gap-x-10 gap-y-2 font-data text-[12px] text-ink-faint tabnum">
            <span>{POOL.tvl} in reserve</span>
            <span>{POOL.payoutRatio} paid out, trailing 90d</span>
            <span>{POOL.totalRebatesCount} rebates issued</span>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
