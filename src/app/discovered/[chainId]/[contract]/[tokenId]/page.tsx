import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { DiscoveredAgentHire } from "@/components/DiscoveredAgentHire";
import { getDiscoveredAgentDetail } from "@/lib/erc8004";
import { getRealHireStatsForAgent } from "@/lib/chain/hires";

// Every field here comes straight from 8004scan's live API on every load --
// deliberately not statically generated or ISR'd beyond that fetch's own
// 300s revalidate, since reputation/health/score fields genuinely change.
export const dynamic = "force-dynamic";

export default async function DiscoveredAgentPage({
  params,
}: {
  params: Promise<{ chainId: string; contract: string; tokenId: string }>;
}) {
  const { chainId, contract, tokenId } = await params;
  const parsedChainId = Number(chainId);
  if (!Number.isFinite(parsedChainId)) notFound();

  const agent = await getDiscoveredAgentDetail(parsedChainId, contract, tokenId);
  if (!agent) notFound();

  // Real, from Backstop's own hire ledger, not the ERC-8004 registry -- the
  // registry has no concept of jobs or payment at all, so this is the one
  // real "activity" number this page can honestly show, and only for the
  // slice of this agent's work that actually ran through Backstop.
  const activity = await getRealHireStatsForAgent(agent.agentId);

  const isMainnet = agent.network === "bsc-mainnet";
  const explorerBase = isMainnet ? "https://bscscan.com" : "https://testnet.bscscan.com";

  return (
    <>
      <Header />
      <main>
        <section data-tone="dark" className="relative overflow-hidden bg-[var(--color-momento-bg)]">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_80%_0%,_var(--color-momento-blue)_0%,_var(--color-momento-bg-deep)_45%,_var(--color-momento-bg)_100%)] opacity-80"
            aria-hidden="true"
          />
          <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 pt-32 sm:pt-40 pb-14 sm:pb-16">
            <div className="flex items-center gap-4">
              <BackButton className="font-data text-[11px] uppercase tracking-wider text-white/50 hover:text-white transition-colors" />
              <Link
                href="/marketplace"
                className="font-data text-[11px] uppercase tracking-wider text-white/50 hover:text-white transition-colors"
              >
                Marketplace / Beyond the roster
              </Link>
            </div>

            <div className="mt-6 flex items-start gap-4">
              {agent.imageUrl && (
                // A registry-hosted, arbitrary third-party image; next/image's
                // remote-pattern allowlist would need to cover every possible
                // agent host, defeating the point.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={agent.imageUrl}
                  alt=""
                  className="size-14 rounded-full object-cover border border-white/20 shrink-0"
                />
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-forum text-white text-4xl sm:text-5xl">{agent.name}</h1>
                  {agent.isVerified && (
                    <span className="text-verdigris text-lg" title="Verified on ERC-8004">
                      ✓
                    </span>
                  )}
                </div>
                <p className="font-data text-xs uppercase tracking-wider text-bronze-bright mt-2">
                  {isMainnet ? "BSC Mainnet" : "BSC Testnet"} · Token #{agent.tokenId}
                </p>
              </div>
            </div>
            {agent.description && (
              <p className="font-body text-lg text-white/60 max-w-2xl leading-relaxed mt-4">
                {agent.description}
              </p>
            )}
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          <div className="border border-bronze-text bg-paper-raised/60 px-5 py-4 mb-10 font-data text-[12px] leading-relaxed">
            <strong className="text-bronze-text">Not part of Backstop&rsquo;s underwritten roster.</strong>{" "}
            The Identity, Capabilities, Reputation, and Health sections below are what the ERC-8004
            registry itself tracks, it&rsquo;s an identity and reputation standard, not a job ledger,
            so it has no concept of jobs or payment at all. The Backstop activity section right
            below is different: it&rsquo;s Backstop&rsquo;s own real ledger, scoped only to jobs that
            actually ran through Backstop. No assurance band or pool coverage applies to this
            agent either way, but a real hire below still opens a genuine ERC-8183 job against its
            real address.
          </div>

          <Section
            title="Backstop activity"
            note="Anchored by Backstop's own hire ledger, not the ERC-8004 registry. Only reflects jobs hired through Backstop, this agent may have a longer history elsewhere Backstop has no visibility into."
          >
            <Field label="Jobs hired through Backstop">{activity.realHireCount.toLocaleString()}</Field>
            <Field label="Payment volume through Backstop">{activity.realVolume.toLocaleString()} U</Field>
            <Field label="Fees to Backstop">Not applicable, no fee relationship with this agent</Field>
            <Field label="Missed &amp; refunded">
              {activity.realRebateCount.toLocaleString()}
              <span className="block text-paper-ink-faint text-[11px] mt-0.5">
                No assurance band applies to a non-catalog agent, so nothing here can ever be
                rebated
              </span>
            </Field>
          </Section>

          <Section title="Identity">
            <Field label="Owner">
              {agent.ownerLabel ?? agent.ownerAddress}
              {agent.ownerLabel && (
                <span className="block font-data text-[11px] text-paper-ink-faint tabnum">
                  {agent.ownerAddress}
                </span>
              )}
            </Field>
            <Field label="Agent wallet">{agent.agentWallet ?? "Not set"}</Field>
            <Field label="Contract">
              <a
                href={`${explorerBase}/address/${agent.contractAddress}`}
                target="_blank"
                rel="noreferrer"
                className="text-bronze-text hover:text-bronze-bright transition-colors tabnum"
              >
                {agent.contractAddress}
              </a>
            </Field>
            <Field label="Registered">
              {agent.createdTxHash ? (
                <a
                  href={`${explorerBase}/tx/${agent.createdTxHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-bronze-text hover:text-bronze-bright transition-colors"
                >
                  Block {agent.createdBlockNumber?.toLocaleString() ?? "?"} →
                </a>
              ) : (
                new Date(agent.createdAt).toLocaleString()
              )}
            </Field>
          </Section>

          <Section title="Capabilities">
            <Field label="Categories">
              {agent.categories.length > 0 ? agent.categories.join(", ") : "Not declared"}
            </Field>
            <Field label="Protocols">
              {agent.supportedProtocols.length > 0 ? agent.supportedProtocols.join(", ") : "None declared"}
              {agent.x402Supported && ", x402"}
            </Field>
            <Field label="Trust models">
              {agent.supportedTrustModels.length > 0 ? agent.supportedTrustModels.join(", ") : "Not declared"}
            </Field>
            <Field label="Tags">{agent.tags.length > 0 ? agent.tags.join(", ") : "None"}</Field>
            {agent.services.length > 0 && (
              <Field label="Services">
                <ul className="space-y-1">
                  {agent.services.map((s) => (
                    <li key={s.protocol} className="tabnum">
                      <span className="uppercase text-paper-ink-faint">{s.protocol}:</span>{" "}
                      {s.endpoint ? (
                        <span className="break-all">{s.endpoint}</span>
                      ) : (
                        <span className="text-paper-ink-faint">no endpoint declared</span>
                      )}
                    </li>
                  ))}
                </ul>
              </Field>
            )}
          </Section>

          <Section title="Reputation">
            <Field label="Total score">{agent.totalScore.toFixed(2)}</Field>
            <Field label="Average feedback score">{agent.averageScore.toFixed(2)}</Field>
            <Field label="Feedbacks">{agent.totalFeedbacks.toLocaleString()}</Field>
            <Field label="Validations">
              {agent.successfulValidations.toLocaleString()} / {agent.totalValidations.toLocaleString()} successful
            </Field>
            {agent.rank !== null && <Field label="Rank">#{agent.rank.toLocaleString()}</Field>}
            {agent.networkRank !== null && (
              <Field label="Network rank">#{agent.networkRank.toLocaleString()}</Field>
            )}
          </Section>

          <Section title="Health & verification">
            <Field label="Overall health">{agent.healthStatus ?? "Unknown"}</Field>
            {agent.healthScore !== null && <Field label="Health score">{agent.healthScore.toFixed(1)}</Field>}
            <Field label="Endpoint verified">
              {agent.isEndpointVerified ? agent.endpointVerifiedDomain ?? "Yes" : "Not verified"}
            </Field>
            {agent.serviceHealth.length > 0 && (
              <Field label="Per-service status">
                <ul className="space-y-1">
                  {agent.serviceHealth.map((s) => (
                    <li key={s.protocol}>
                      <span className="uppercase text-paper-ink-faint">{s.protocol}:</span> {s.status}
                      {s.message && <span className="text-paper-ink-faint">: {s.message}</span>}
                    </li>
                  ))}
                </ul>
              </Field>
            )}
          </Section>

          <Section title="Score breakdown" note="8004scan's own composite signals for this agent, not a Backstop figure.">
            <Field label="Quality">{agent.scoreBreakdown.quality.toFixed(1)}</Field>
            <Field label="Popularity">{agent.scoreBreakdown.popularity.toFixed(1)}</Field>
            <Field label="Activity">{agent.scoreBreakdown.activity.toFixed(1)}</Field>
            <Field label="Wallet">{agent.scoreBreakdown.wallet.toFixed(1)}</Field>
            <Field label="Freshness">{agent.scoreBreakdown.freshness.toFixed(1)}</Field>
            <Field label="Metadata completeness">{agent.scoreBreakdown.metadataCompleteness.toFixed(1)}</Field>
          </Section>

          <div className="mt-12 max-w-md">
            <DiscoveredAgentHire agent={agent} />
          </div>

          <a
            href={`https://www.8004scan.io/agent/${agent.agentId}`}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-8 font-data text-xs uppercase tracking-wider text-bronze-text hover:text-bronze-bright transition-colors"
          >
            View full record on 8004scan →
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10 pb-10 border-b border-paper-line last:border-b-0">
      <h2 className="font-display text-lg mb-1">{title}</h2>
      {note && <p className="text-[12px] text-paper-ink-faint mb-4">{note}</p>}
      <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4 font-data text-[13px] mt-4">{children}</dl>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-paper-ink-faint text-[10px] uppercase tracking-wider mb-1">{label}</dt>
      <dd className="text-paper-ink break-words">{children}</dd>
    </div>
  );
}
