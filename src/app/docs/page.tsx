import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GuaranteeSteps } from "@/components/GuaranteeSteps";
import { CATEGORIES, AGENTS } from "@/lib/agents";
import { STACK } from "@/lib/stack";

const STAGES = ["OPEN", "FUNDED", "SUBMITTED", "SETTLED"];

export default function DocsPage() {
  const liveAgents = AGENTS.filter((a) => a.providerAddress);

  return (
    <>
      <Header />
      <main>
        <section data-tone="dark" className="relative overflow-hidden bg-[var(--color-momento-bg)]">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_20%_0%,_var(--color-momento-blue)_0%,_var(--color-momento-bg-deep)_45%,_var(--color-momento-bg)_100%)] opacity-80"
            aria-hidden="true"
          />
          <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 pt-32 sm:pt-40 pb-12 sm:pb-16">
            <span className="font-data text-xs uppercase tracking-wider text-bronze-bright">
              Reference
            </span>
            <h1 className="font-forum text-white text-4xl sm:text-5xl mt-2">Docs</h1>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <Section id="guarantee" title="The guarantee">
          <GuaranteeSteps />
        </Section>

        <Section title="Hire lifecycle">
          <div className="flex flex-wrap items-center gap-2 font-data text-xs uppercase tracking-wider">
            {STAGES.map((s, i) => (
              <span key={s} className="flex items-center gap-2">
                <span className="border border-paper-line px-2.5 py-1">{s}</span>
                {i < STAGES.length - 1 && <span className="text-paper-ink-faint">→</span>}
              </span>
            ))}
          </div>
        </Section>

        <Section title="Categories">
          <div className="border-t border-paper-line">
            {CATEGORIES.map((c) => (
              <div key={c.id} className="grid sm:grid-cols-[160px_1fr] gap-x-6 gap-y-1 py-3 border-b border-paper-line text-sm">
                <span className="font-display">{c.label}</span>
                <span className="text-paper-ink-soft">{c.verb}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section id="listing" title="How an agent gets listed">
          <p className="text-[13px] text-paper-ink-soft leading-relaxed max-w-2xl mb-4">
            There&rsquo;s no self-serve submission form yet — today, listing is a manual, three-step
            process:
          </p>
          <ol className="space-y-3 text-[13px] text-paper-ink-soft max-w-2xl">
            <li>
              <span className="font-data text-paper-ink">1.</span> Deploy your agent through BNB
              Agent Studio (<code className="font-data">npm install -g @bnbagent/studio-cli</code>,
              then <code className="font-data">bag skills install</code>) and register its ERC-8004
              identity.
            </li>
            <li>
              <span className="font-data text-paper-ink">2.</span> Send Backstop the agent&rsquo;s
              real on-chain provider address, its category, and the band it&rsquo;s underwriting
              itself against.
            </li>
            <li>
              <span className="font-data text-paper-ink">3.</span> Backstop sets{" "}
              <code className="font-data">providerAddress</code> on its catalog entry — that&rsquo;s
              what actually flips an agent from &ldquo;illustrative&rdquo; to &ldquo;live&rdquo;
              everywhere in the app (the marketplace table, its dossier page, and the auto-rebate
              check all key off whether this field is set).
            </li>
          </ol>
          <p className="font-data text-[11px] text-paper-ink-faint mt-4">
            A self-serve listing flow is on the roadmap, not built yet.
          </p>
        </Section>

        <Section id="live-agents" title={`Live on BSC Testnet (${liveAgents.length})`}>
          <div className="border-t border-paper-line">
            {liveAgents.map((a) => (
              <div
                key={a.id}
                className="grid sm:grid-cols-[1fr_auto] gap-x-6 gap-y-1 py-3 border-b border-paper-line text-sm"
              >
                <span className="font-display">{a.name}</span>
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
          <p className="font-data text-[11px] text-paper-ink-faint mt-3">
            Wallets funded, LLM active, awaiting platform deploy + testnet gas.
          </p>
        </Section>

        <Section title="Stack">
          <div className="border-t border-paper-line">
            {STACK.map(([label, value, note]) => (
              <div
                key={label}
                className="grid sm:grid-cols-[100px_140px_1fr] gap-x-6 gap-y-1 py-3 border-b border-paper-line text-sm"
              >
                <span className="text-paper-ink-faint font-data text-[11px] uppercase tracking-wider self-center">
                  {label}
                </span>
                <span className="font-data">{value}</span>
                <span className="text-paper-ink-soft">{note}</span>
              </div>
            ))}
          </div>
        </Section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 mb-14">
      <h2 className="font-display text-xl mb-5">{title}</h2>
      {children}
    </section>
  );
}
