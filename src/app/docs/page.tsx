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
      <main className="max-w-3xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <span className="font-data text-xs uppercase tracking-wider text-bronze-text">
          Reference
        </span>
        <h1 className="font-display text-4xl sm:text-5xl mt-2 mb-14">Docs</h1>

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
