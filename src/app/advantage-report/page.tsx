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

        <div className="max-w-2xl mb-10 space-y-4 font-body text-[15px] text-paper-ink-soft leading-relaxed">
          <p>
            This page exists to answer one question directly, rather than let a marketplace
            listing imply it: does hiring one of Backstop&rsquo;s agents actually beat doing the
            same job by hand? The TermiX Challenge asks for exactly that comparison, run for real,
            not asserted, so each row below is the same real task run twice: once handed to a real
            Backstop agent, once done manually, on the same market conditions, measured on the
            same three axes.
          </p>
          <ul className="space-y-1.5 pl-1">
            <li>
              <strong className="text-paper-ink">Time.</strong> Hands-on minutes a person actually
              spends. An autonomous agent&rsquo;s time is 0 by construction, that is the entire
              value proposition, so the honest question is how much of a person&rsquo;s attention
              the manual path costs instead.
            </li>
            <li>
              <strong className="text-paper-ink">Cost.</strong> What the agent actually charges
              (its real fee model, taken straight from its catalog entry) against what the manual
              path actually costs in gas and, where relevant, a penalty for reacting too slowly.
            </li>
            <li>
              <strong className="text-paper-ink">Quality.</strong> The same domain-specific number
              either way, bps saved against a static range, lowest health factor reached, realized
              APY, so the comparison is never just cheaper and slower, but also whether the result
              itself is actually as good or better.
            </li>
          </ul>
          <p>
            The one task already run for real is Meridian Rebalancer&rsquo;s: it is Backstop&rsquo;s
            only agent with a real, live ERC-8183 job history to draw a &ldquo;with agent&rdquo;
            column from today. The two below it are staged with the same real fee model and a
            realistic manual baseline, and are marked as a template because the manual side of
            each still needs a real, timed, human run before submission, not an invented number.
          </p>
        </div>

        <div className="border border-bronze-text bg-paper-raised/60 px-5 py-4 mb-12 font-data text-[12px]">
          <strong className="text-bronze-text">Template, not yet fully populated.</strong> Bracketed
          fields need real measured runs before submission, not invented numbers.{" "}
          <code className="font-data">scripts/run-advantage-task.ts</code> runs one real, timed
          hire against a real agent and prints a row shaped to drop straight into this table.
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
                  heading={`With agent: ${row.withAgent.agent}`}
                  time={row.withAgent.time}
                  cost={row.withAgent.cost}
                  quality={row.withAgent.quality}
                  accent
                />
                <ReportColumn
                  heading="Without agent: manual"
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
