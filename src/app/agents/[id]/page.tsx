import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AssuranceBandInteractive } from "@/components/AssuranceBandInteractive";
import { HireFlow } from "@/components/HireFlow";
import { GettingStarted } from "@/components/GettingStarted";
import { FaqAccordion } from "@/components/FaqAccordion";
import { SimilarAgents } from "@/components/SimilarAgents";
import { PoolTelemetry } from "@/components/PoolTelemetry";
import { AgentStats } from "@/components/AgentStats";
import { AGENTS, getAgent, categoryMeta } from "@/lib/agents";
import { lookupAgentByOwner } from "@/lib/erc8004";
import { getLivePoolState, TESTNET_TOKENS } from "@/lib/pancakeswap";
import { getRecentPoolSnapshots, computePoolDrift } from "@/lib/chain/poolSnapshots";
import { getRealHireStatsForAgent } from "@/lib/chain/hires";

export function generateStaticParams() {
  return AGENTS.map((a) => ({ id: a.id }));
}

// Without this, Next prerenders this page once at build time (it's fully
// eligible for static optimization otherwise) and the "Live PancakeSwap v3
// pool" banner and ERC-8004 registration status below would be frozen at
// build time for every visitor — the opposite of what "live" means here.
// getLivePoolState is cached for 30s server-side (src/lib/pancakeswap.ts)
// and lookupAgentByOwner already sets its own 300s fetch revalidate, so
// this doesn't turn into a fresh network round-trip on every single
// request either.
export const dynamic = "force-dynamic";

export default async function AgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = getAgent(id);
  if (!agent) notFound();
  const category = categoryMeta(agent.category)!;
  const tracksPancakeV3 =
    Boolean(agent.providerAddress) &&
    agent.protocols.includes("PancakeSwap v3");
  const [registration, pool, hireStats] = await Promise.all([
    agent.providerAddress
      ? lookupAgentByOwner(agent.providerAddress)
      : Promise.resolve(null),
    tracksPancakeV3
      ? getLivePoolState(TESTNET_TOKENS.WBNB, TESTNET_TOKENS.USDT)
      : Promise.resolve(null),
    getRealHireStatsForAgent(agent.id),
  ]);
  // A real snapshot history for this exact pool (recorded every 30 minutes
  // by the auto-rebate cron — see src/lib/chain/poolSnapshots.ts) — fetched
  // only once we know there's a live pool to have a history for.
  const snapshots = pool ? await getRecentPoolSnapshots(pool.poolAddress) : [];
  const drift = computePoolDrift(snapshots);

  return (
    <>
      <Header />
      <main>
        <section
          data-tone="dark"
          className="relative overflow-hidden bg-[var(--color-momento-bg)]"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_80%_0%,_var(--color-momento-blue)_0%,_var(--color-momento-bg-deep)_45%,_var(--color-momento-bg)_100%)] opacity-80"
            aria-hidden="true"
          />
          <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-32 sm:pt-40 pb-14 sm:pb-16">
            <Link
              href={`/marketplace?category=${agent.category}`}
              className="font-data text-[11px] uppercase tracking-wider text-white/50 hover:text-white transition-colors"
            >
              Marketplace / {category.label} /{" "}
              <span className="text-white/70">{agent.name}</span>
            </Link>

            <div className="mt-6">
              <span className="font-data text-xs uppercase tracking-wider text-bronze-bright">
                {category.clause}
              </span>
              <h1 className="font-forum text-white text-4xl sm:text-5xl mt-2 mb-4">
                {agent.name}
              </h1>
              <p className="font-body text-lg text-white/60 max-w-2xl leading-relaxed">
                {agent.description}
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 py-6 border-y border-paper-line mb-12 font-data text-[13px]">
            <div>
              <dt className="text-paper-ink-faint text-[10px] uppercase tracking-wider mb-1">
                Operator
              </dt>
              <dd>{agent.operator}</dd>
            </div>
            <div>
              <dt className="text-paper-ink-faint text-[10px] uppercase tracking-wider mb-1">
                Identity
                {agent.providerAddress && (
                  <span
                    className={
                      registration ? "text-verdigris" : "text-paper-ink-faint"
                    }
                  >
                    {" "}
                    ●
                  </span>
                )}
              </dt>
              {registration ? (
                <dd>
                  <a
                    href={`https://www.8004scan.io/agent/${registration.agentId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-bronze-text transition-colors"
                  >
                    ERC-8004 · token #{registration.tokenId}
                  </a>
                  {registration.isVerified && (
                    <span className="text-verdigris"> · verified</span>
                  )}
                </dd>
              ) : agent.providerAddress ? (
                <dd className="text-paper-ink-faint">
                  Not yet registered on ERC-8004
                </dd>
              ) : (
                <dd
                  className="text-paper-ink-faint"
                  title="No live onchain wallet, illustrative listing"
                >
                  Illustrative
                </dd>
              )}
            </div>
            <div>
              <dt className="text-paper-ink-faint text-[10px] uppercase tracking-wider mb-1">
                Network
              </dt>
              <dd className="flex items-center gap-1.5">
                <i
                  className={`inline-block w-2 h-2 shrink-0 ${
                    agent.network === "BSC Testnet"
                      ? "bg-bronze-text"
                      : "bg-paper-ink"
                  }`}
                  aria-hidden="true"
                />
                {agent.network}
              </dd>
            </div>
            <div>
              <dt className="text-paper-ink-faint text-[10px] uppercase tracking-wider mb-1">
                Fee
              </dt>
              <dd>{agent.feeModel}</dd>
            </div>
            {agent.providerAddress && (
              <div>
                <dt className="text-paper-ink-faint text-[10px] uppercase tracking-wider mb-1">
                  <span className="text-verdigris">●</span> Live address
                </dt>
                <dd className="truncate">
                  <a
                    href={`https://testnet.bscscan.com/address/${agent.providerAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-bronze-text transition-colors"
                  >
                    {agent.providerAddress.slice(0, 8)}…
                    {agent.providerAddress.slice(-6)}
                  </a>
                </dd>
              </div>
            )}
          </dl>

          {pool && <PoolTelemetry pool={pool} drift={drift} snapshotCount={snapshots.length} />}

          <div className="grid lg:grid-cols-[1fr_360px] gap-10 lg:gap-14">
            <div className="space-y-14">
              <AgentStats agent={agent} stats={hireStats} />

              <div>
                <span className="font-data text-[11px] uppercase tracking-wider text-bronze-text block mb-3">
                  The assurance band
                </span>
                <AssuranceBandInteractive
                  band={agent.band}
                  agentName={agent.name}
                />

                <Link
                  href="/docs#guarantee"
                  className="mt-4 inline-block font-data text-[11px] uppercase tracking-wider text-paper-ink-faint hover:text-bronze-text transition-colors"
                >
                  How the guarantee works →
                </Link>
              </div>

              <div>
                <span className="font-data text-[11px] uppercase tracking-wider text-bronze-text block mb-3">
                  Getting started
                </span>
                <GettingStarted agent={agent} />
              </div>

              <div>
                <span className="font-data text-[11px] uppercase tracking-wider text-bronze-text block mb-3">
                  Questions
                </span>
                <FaqAccordion agent={agent} />
              </div>

              <SimilarAgents agent={agent} />
            </div>

            <div className="lg:sticky lg:top-24 self-start">
              <HireFlow agent={agent} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
