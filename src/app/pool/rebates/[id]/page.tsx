import { notFound } from "next/navigation";
import Link from "next/link";
import { formatUnits } from "viem";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getRebateById, type RealRebateDetail } from "@/lib/chain/rebates";
import { REBATE_LOG, type RebateLogEntry } from "@/lib/pool";
import { getAgent } from "@/lib/agents";

// Real rebate rows load per request (a live Supabase read); illustrative
// REBATE_LOG entries are static, but the route as a whole still needs to be
// dynamic so a real id is actually looked up fresh, not frozen at build.
export const dynamic = "force-dynamic";

export default async function RebateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const illustrative = REBATE_LOG.find((r) => r.id === id);
  if (illustrative) {
    return <IllustrativeDetail entry={illustrative} />;
  }

  const real = await getRebateById(id);
  if (!real) notFound();
  return <RealDetail rebate={real} />;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>
        <section data-tone="dark" className="relative overflow-hidden bg-[var(--color-momento-bg)]">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_20%_0%,_var(--color-momento-glow)_0%,_var(--color-momento-bg-deep)_45%,_var(--color-momento-bg)_100%)] opacity-80"
            aria-hidden="true"
          />
          <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 pt-32 sm:pt-40 pb-14 sm:pb-16">
            <Link
              href="/pool"
              className="font-data text-[11px] uppercase tracking-wider text-white/50 hover:text-white transition-colors"
            >
              Pool / Backstop in action
            </Link>
            <h1 className="font-forum text-white text-4xl sm:text-5xl mt-4">Rebate detail</h1>
          </div>
        </section>
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14 sm:py-20">{children}</div>
      </main>
      <Footer />
    </>
  );
}

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <div className="text-paper-ink-faint text-[10px] uppercase tracking-wider mb-1">{label}</div>
      <div className={mono ? "font-data text-sm break-all" : "font-body text-sm"}>{value}</div>
    </div>
  );
}

function RealDetail({ rebate }: { rebate: RealRebateDetail }) {
  return (
    <Shell>
      <div className="flex items-center gap-3 mb-6">
        <span className="font-data text-[10px] uppercase tracking-wider px-2 py-0.5 border border-verdigris text-verdigris">
          Real payout
        </span>
        <span className="font-data text-xs text-paper-ink-faint tabnum">
          {new Date(rebate.paidAt).toLocaleString()}
        </span>
      </div>
      <h2 className="font-display text-3xl mb-2">
        <Link href={`/agents/${rebate.agentId}`} className="hover:text-bronze-text transition-colors">
          {rebate.agentName}
        </Link>
      </h2>
      <p className="font-body text-paper-ink-soft leading-relaxed mb-8 max-w-2xl">{rebate.reason}</p>

      <div className="border border-paper-line bg-paper-raised/50 p-6 sm:p-8 grid sm:grid-cols-2 gap-6 mb-8">
        <Field label="Amount refunded" value={`${formatUnits(BigInt(rebate.amountRaw), 18)} U`} mono />
        <Field label="Hire id" value={rebate.hireId} mono />
        <Field label="Hirer wallet" value={rebate.hirerWallet} mono />
        <Field label="Original hire budget" value={`${rebate.hireBudgetHuman} U`} mono />
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {rebate.txHash && (
          <a
            href={`https://testnet.bscscan.com/tx/${rebate.txHash}`}
            target="_blank"
            rel="noreferrer"
            className="font-data text-xs uppercase tracking-wider text-bronze-text underline underline-offset-2"
          >
            View rebate transaction on BscScan Testnet →
          </a>
        )}
        {rebate.hireTxHash && (
          <a
            href={`https://testnet.bscscan.com/tx/${rebate.hireTxHash}`}
            target="_blank"
            rel="noreferrer"
            className="font-data text-xs uppercase tracking-wider text-paper-ink-faint hover:text-bronze-text underline underline-offset-2"
          >
            View original hire transaction →
          </a>
        )}
      </div>
    </Shell>
  );
}

function IllustrativeDetail({ entry }: { entry: RebateLogEntry }) {
  const agent = getAgent(entry.agent.toLowerCase().replace(/\s+/g, "-"));
  return (
    <Shell>
      <div className="flex items-center gap-3 mb-6">
        <span className="font-data text-[10px] uppercase tracking-wider px-2 py-0.5 border border-paper-line text-paper-ink-faint">
          Illustrative
        </span>
        <span className="font-data text-xs text-paper-ink-faint tabnum">{entry.time}</span>
      </div>
      <h2 className="font-display text-3xl mb-2">
        {agent ? (
          <Link href={`/agents/${agent.id}`} className="hover:text-bronze-text transition-colors">
            {entry.agent}
          </Link>
        ) : (
          entry.agent
        )}
      </h2>
      <p className="font-body text-paper-ink-soft leading-relaxed mb-8 max-w-2xl">{entry.reason}</p>

      <div className="border border-paper-line bg-paper-raised/50 p-6 sm:p-8 grid sm:grid-cols-2 gap-6">
        <Field label="Category" value={entry.category} />
        <Field label="Clause" value={entry.clause} />
        <Field label="Amount" value={entry.amount} mono />
        <Field label="Illustrative tx reference" value={entry.txHash} mono />
      </div>
      <p className="mt-6 font-data text-[11px] text-paper-ink-faint max-w-2xl">
        This entry is illustrative sample data, not a real onchain payout. Its transaction
        reference above is not a real, resolvable hash.
      </p>
    </Shell>
  );
}
