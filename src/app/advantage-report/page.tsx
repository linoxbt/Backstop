import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface ReportRow {
  task: string;
  domain: string;
  withAgent: { agent: string; time: string; cost: string; quality: string };
  withoutAgent: { time: string; cost: string; quality: string };
  delta: string;
}

const ROWS: ReportRow[] = [
  {
    task: "Maintain a BNB/USDT PancakeSwap v3 range through one volatile trading day",
    domain: "Trading",
    withAgent: {
      agent: "Meridian Rebalancer",
      time: "0 min hands-on (autonomous)",
      cost: "0.4% of fees captured",
      quality: "[fill in: bps saved vs. static range, from manifest]",
    },
    withoutAgent: {
      time: "[fill in: minutes spent manually re-centering]",
      cost: "[fill in: gas from manual resets]",
      quality: "[fill in: bps saved vs. static range, manual]",
    },
    delta: "[fill in once both runs are measured]",
  },
  {
    task: "Keep a leveraged Venus position above a 1.35 health factor through a fast drawdown",
    domain: "Security",
    withAgent: {
      agent: "Sentry HF",
      time: "0 min hands-on (autonomous)",
      cost: "0.15% of position value / month",
      quality: "[fill in: lowest HF reached, liquidation avoided y/n]",
    },
    withoutAgent: {
      time: "[fill in: minutes to notice + manually de-lever]",
      cost: "[fill in: gas + any liquidation penalty incurred]",
      quality: "[fill in: lowest HF reached, liquidation avoided y/n]",
    },
    delta: "[fill in once both runs are measured]",
  },
  {
    task: "Route an idle stablecoin balance to the best available APR over one week",
    domain: "Stock / Treasury",
    withAgent: {
      agent: "Cistern Yield",
      time: "0 min hands-on (autonomous)",
      cost: "8% of yield earned",
      quality: "[fill in: realized APY vs. best available]",
    },
    withoutAgent: {
      time: "[fill in: minutes spent checking rates + moving funds]",
      cost: "[fill in: gas from manual moves]",
      quality: "[fill in: realized APY, manual]",
    },
    delta: "[fill in once both runs are measured]",
  },
];

export default function AdvantageReportPage() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <span className="font-data text-xs uppercase tracking-wider text-bronze-text">
          TermiX Challenge deliverable
        </span>
        <h1 className="font-display text-4xl sm:text-5xl mt-3 mb-6">Agent Advantage Report</h1>
        <p className="font-body text-lg text-paper-ink-soft max-w-2xl mb-8">
          Same task. With an agent, and without. Time, cost, quality.
        </p>

        <div className="border border-bronze-text bg-paper-raised/60 px-5 py-4 mb-12 font-data text-[12px]">
          <strong className="text-bronze-text">Template — not yet populated.</strong> Bracketed
          fields need real measured runs before submission, not invented numbers.
        </div>

        <div className="space-y-10">
          {ROWS.map((row, i) => (
            <div key={row.task} className="border-t border-paper-line pt-8">
              <div className="flex flex-wrap items-baseline justify-between gap-3 mb-2">
                <span className="font-data text-[11px] uppercase tracking-wider text-bronze-text">
                  Task {i + 1} · {row.domain}
                </span>
              </div>
              <h2 className="font-display text-xl mb-6 max-w-2xl">{row.task}</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <ReportColumn
                  heading={`With agent — ${row.withAgent.agent}`}
                  time={row.withAgent.time}
                  cost={row.withAgent.cost}
                  quality={row.withAgent.quality}
                  accent
                />
                <ReportColumn
                  heading="Without agent — manual"
                  time={row.withoutAgent.time}
                  cost={row.withoutAgent.cost}
                  quality={row.withoutAgent.quality}
                />
              </div>
              <p className="mt-5 font-data text-[12px] text-paper-ink-faint">
                Net advantage: <span className="text-paper-ink">{row.delta}</span>
              </p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

function ReportColumn({
  heading,
  time,
  cost,
  quality,
  accent,
}: {
  heading: string;
  time: string;
  cost: string;
  quality: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`p-5 border ${accent ? "border-bronze-text bg-paper-raised/40" : "border-paper-line"}`}
    >
      <div className="font-data text-[11px] uppercase tracking-wider text-paper-ink-faint mb-3">
        {heading}
      </div>
      <dl className="space-y-2 font-body text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-paper-ink-soft">Time</dt>
          <dd className="text-right">{time}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-paper-ink-soft">Cost</dt>
          <dd className="text-right">{cost}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-paper-ink-soft">Quality</dt>
          <dd className="text-right">{quality}</dd>
        </div>
      </dl>
    </div>
  );
}
