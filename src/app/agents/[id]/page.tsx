import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AssuranceBandInteractive } from "@/components/AssuranceBandInteractive";
import { HireFlow } from "@/components/HireFlow";
import { AGENTS, getAgent, categoryMeta } from "@/lib/agents";
import { lookupAgentByOwner } from "@/lib/erc8004";

export function generateStaticParams() {
  return AGENTS.map((a) => ({ id: a.id }));
}

export default async function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = getAgent(id);
  if (!agent) notFound();
  const category = categoryMeta(agent.category)!;
  const registration = agent.providerAddress
    ? await lookupAgentByOwner(agent.providerAddress)
    : null;

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <Link
          href={`/marketplace?category=${agent.category}`}
          className="font-data text-[11px] uppercase tracking-wider text-ink-faint hover:text-bronze-text transition-colors"
        >
          ← {category.label}
        </Link>

        <div className="mt-6 mb-10">
          <span className="font-data text-xs uppercase tracking-wider text-bronze-text">
            {category.clause}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl mt-2 mb-4">{agent.name}</h1>
          <p className="font-body text-lg text-ink-soft max-w-2xl leading-relaxed">
            {agent.description}
          </p>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 py-6 border-y border-stone-line mb-12 font-data text-[13px]">
          <div>
            <dt className="text-ink-faint text-[10px] uppercase tracking-wider mb-1">Operator</dt>
            <dd>{agent.operator}</dd>
          </div>
          <div>
            <dt className="text-ink-faint text-[10px] uppercase tracking-wider mb-1">
              Identity
              {agent.providerAddress && (
                <span className={registration ? "text-verdigris" : "text-ink-faint"}> ●</span>
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
                {registration.isVerified && <span className="text-verdigris"> · verified</span>}
              </dd>
            ) : agent.providerAddress ? (
              <dd className="text-ink-faint">Not yet registered on ERC-8004</dd>
            ) : (
              <dd className="text-ink-faint" title="No live on-chain wallet — illustrative listing">
                Illustrative
              </dd>
            )}
          </div>
          <div>
            <dt className="text-ink-faint text-[10px] uppercase tracking-wider mb-1">Network</dt>
            <dd>{agent.network}</dd>
          </div>
          <div>
            <dt className="text-ink-faint text-[10px] uppercase tracking-wider mb-1">Fee</dt>
            <dd>{agent.feeModel}</dd>
          </div>
          {agent.providerAddress && (
            <div>
              <dt className="text-ink-faint text-[10px] uppercase tracking-wider mb-1">
                <span className="text-verdigris">●</span> Live address
              </dt>
              <dd className="truncate">
                <a
                  href={`https://testnet.bscscan.com/address/${agent.providerAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-bronze-text transition-colors"
                >
                  {agent.providerAddress.slice(0, 8)}…{agent.providerAddress.slice(-6)}
                </a>
              </dd>
            </div>
          )}
        </dl>

        <div className="grid lg:grid-cols-[1fr_360px] gap-10 lg:gap-14">
          <div>
            <span className="font-data text-[11px] uppercase tracking-wider text-bronze-text block mb-3">
              The assurance band
            </span>
            <AssuranceBandInteractive band={agent.band} agentName={agent.name} />

            <Link
              href="/docs#guarantee"
              className="mt-4 inline-block font-data text-[11px] uppercase tracking-wider text-ink-faint hover:text-bronze-text transition-colors"
            >
              How the guarantee works →
            </Link>
          </div>

          <div>
            <HireFlow agent={agent} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
