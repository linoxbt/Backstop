import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { POOL, REBATE_LOG } from "@/lib/pool";

export default function PoolPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-steel text-paper-on-steel">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
            <span className="font-data text-xs uppercase tracking-[0.2em] text-bronze-bright">
              The reserve
            </span>
            <h1 className="font-display text-4xl sm:text-5xl mt-4 mb-6 text-balance">
              What actually stands behind a guarantee
            </h1>
            <p className="font-body text-lg text-paper-on-steel/75 max-w-2xl leading-relaxed mb-12">
              Every listed agent routes a share of its fee into this pool. When a hire misses its
              promised band, the pool pays the rebate directly — through a session with a hard
              spend cap, not a human approving a claim.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10">
              <Stat label="Pool balance" value={POOL.tvl} note={POOL.tvlUnit} />
              <Stat label="Payout ratio" value={POOL.payoutRatio} note={POOL.payoutRatioNote} />
              <Stat
                label="Solvency buffer"
                value={POOL.solvencyBuffer}
                note={POOL.solvencyBufferNote}
              />
              <Stat
                label="Rebates paid"
                value={POOL.totalRebatesPaid}
                note={`${POOL.totalRebatesCount} payouts to date`}
              />
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <span className="font-data text-xs uppercase tracking-wider text-bronze-text block mb-3">
            Clause 0 — Session authority
          </span>
          <h2 className="font-display text-3xl mb-6">The session that pays you</h2>
          <p className="font-body text-ink-soft max-w-2xl mb-8 leading-relaxed">
            The pool itself is an Altana smart wallet. It never holds standing authority beyond
            what&rsquo;s written here — a hirer can read these limits before funding a job, the
            same way they read the assurance band.
          </p>
          <div className="border border-stone-line bg-stone-raised/50 p-6 sm:p-8 grid sm:grid-cols-2 gap-6 mb-6">
            <Field label="Call allowlist" value={POOL.session.callAllowlist.join(", ")} mono />
            <Field label="Spend cap" value={POOL.session.spendCap} mono />
            <Field label="Expiry" value={POOL.session.expiry} />
            <Field label="Registered in" value={POOL.session.registeredIn} />
            <Field label="Vault address" value={POOL.vaultAddress} mono />
          </div>
          <button
            type="button"
            className="font-data text-xs uppercase tracking-wider border border-ink px-4 py-2.5 hover:bg-ink hover:text-stone transition-colors"
            title="Opens the pool's session in the Altana Keystore Explorer"
          >
            View in Altana Keystore Explorer →
          </button>
        </section>

        <section className="max-w-4xl mx-auto px-5 sm:px-8 pb-20 sm:pb-28">
          <span className="font-data text-xs uppercase tracking-wider text-bronze-text block mb-3">
            Clause 1 — Ledger
          </span>
          <h2 className="font-display text-3xl mb-8">Recent payouts</h2>
          <div className="border-t border-stone-line">
            {REBATE_LOG.map((r) => (
              <div
                key={r.id}
                className="grid sm:grid-cols-[1fr_auto] gap-x-6 gap-y-2 py-5 border-b border-stone-line"
              >
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                    <span className="font-display text-lg">{r.agent}</span>
                    <span className="font-data text-[10px] uppercase tracking-wider text-ink-faint">
                      {r.category}
                    </span>
                    <span className="font-data text-[10px] uppercase tracking-wider text-bronze-text">
                      {r.clause}
                    </span>
                  </div>
                  <p className="font-body text-sm text-ink-soft">{r.reason}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-data text-sm tabnum">{r.amount}</div>
                  <div className="font-data text-[11px] text-ink-faint tabnum">{r.time}</div>
                  <div className="font-data text-[11px] text-ink-faint">{r.txHash}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div>
      <div className="font-data text-[10px] uppercase tracking-wider text-paper-on-steel/50 mb-2">
        {label}
      </div>
      <div className="font-display text-2xl sm:text-3xl mb-1.5 tabnum">{value}</div>
      <div className="font-body text-xs text-paper-on-steel/60 leading-snug">{note}</div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="font-data text-[10px] uppercase tracking-wider text-ink-faint mb-1">
        {label}
      </div>
      <div className={mono ? "font-data text-sm break-all" : "font-body text-sm"}>{value}</div>
    </div>
  );
}
