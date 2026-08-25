import { formatUnits } from "viem";
import { AGENTS, CATEGORIES } from "@/lib/agents";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { POOL, REBATE_LOG } from "@/lib/pool";
import { getPoolSessionInfo } from "@/lib/wallet/altanaPool";
import { checkRebalancerBreach } from "@/lib/chain/rebalanceBreach";
import { checkAgentBandBreaches } from "@/lib/chain/bandBreach";
import { getRecentRebates } from "@/lib/chain/rebates";

const SHADE = ["bg-ink", "bg-bronze-text", "bg-verdigris", "bg-ink-soft"];

export default async function PoolPage() {
  const [session, liquidityCheck, bandBreachCheck, realRebates] = await Promise.all([
    getPoolSessionInfo(),
    checkRebalancerBreach(),
    Promise.resolve(checkAgentBandBreaches()),
    getRecentRebates(),
  ]);
  const totalHirers = AGENTS.reduce((sum, a) => sum + a.hirers, 0);
  const cleanEntries = AGENTS.filter((a) => a.band.status === "within");

  return (
    <>
      <Header />
      <main>
        <section className="border-b border-stone-line bg-stone-raised/40">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-24 text-center">
            <span className="font-data text-xs uppercase tracking-[0.2em] text-bronze-text">
              The reserve
            </span>
            <div className="font-display text-5xl sm:text-6xl mt-4 mb-2 tabnum">{POOL.tvl}</div>
            <p className="font-body text-ink-soft mb-10">
              protecting agent jobs across {AGENTS.length} agents, {CATEGORIES.length} categories
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-10 max-w-xl mx-auto text-left">
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
            What it protects
          </span>
          <h2 className="font-display text-3xl mb-6">Protection by category</h2>
          <p className="font-body text-ink-soft max-w-2xl mb-6">
            Weighted by hirers per category — where the pool&rsquo;s obligation is actually
            concentrated, not an invented dollar split.
          </p>
          <div className="flex h-3 w-full overflow-hidden border border-stone-line mb-3">
            {CATEGORIES.map((c, i) => {
              const hirers = AGENTS.filter((a) => a.category === c.id).reduce(
                (sum, a) => sum + a.hirers,
                0,
              );
              return (
                <div
                  key={c.id}
                  className={SHADE[i % SHADE.length]}
                  style={{ width: `${(hirers / totalHirers) * 100}%` }}
                  title={`${c.label}: ${hirers} hirers`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 font-data text-[11px] text-ink-soft">
            {CATEGORIES.map((c, i) => {
              const hirers = AGENTS.filter((a) => a.category === c.id).reduce(
                (sum, a) => sum + a.hirers,
                0,
              );
              return (
                <span key={c.id} className="flex items-center gap-1.5">
                  <i className={`inline-block w-2.5 h-2.5 shrink-0 ${SHADE[i % SHADE.length]}`} />
                  {c.label} · {Math.round((hirers / totalHirers) * 100)}%
                </span>
              );
            })}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-20 border-t border-stone-line">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-data text-xs uppercase tracking-wider text-bronze-text">
              Clause 0 — Session authority
            </span>
            <span
              className={`font-data text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
                session.configured
                  ? "border-verdigris text-verdigris"
                  : "border-stone-line text-ink-faint"
              }`}
            >
              {session.configured ? "● Live session" : "Illustrative"}
            </span>
          </div>
          <h2 className="font-display text-3xl mb-6">The session that pays you</h2>
          <p className="font-body text-ink-soft max-w-2xl mb-8">
            An Altana smart wallet, scoped to exactly this.
          </p>
          <div className="border border-stone-line bg-stone-raised/50 p-6 sm:p-8 grid sm:grid-cols-2 gap-6 mb-6">
            {session.configured ? (
              <>
                <Field label="Call allowlist" value={(session.callAllowlist ?? []).join(", ")} mono />
                <Field label="Spend cap" value={session.spendCap ?? "—"} mono />
                <Field
                  label="Expiry"
                  value={session.expiry ? new Date(session.expiry * 1000).toISOString() : "—"}
                />
                <Field label="Registered in" value="Altana Keystore" />
                <Field label="Session wallet" value={session.walletAddress ?? "—"} mono />
              </>
            ) : (
              <>
                <Field label="Call allowlist" value={POOL.session.callAllowlist.join(", ")} mono />
                <Field label="Spend cap" value={POOL.session.spendCap} mono />
                <Field label="Expiry" value={POOL.session.expiry} />
                <Field label="Registered in" value={POOL.session.registeredIn} />
                <Field label="Vault address" value={POOL.vaultAddress} mono />
              </>
            )}
          </div>
          {session.configured && session.walletAddress ? (
            <a
              href={`https://testnet.bscscan.com/address/${session.walletAddress}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block font-data text-xs uppercase tracking-wider border border-ink px-4 py-2.5 hover:bg-ink hover:text-stone transition-colors"
            >
              View session wallet on BscScan Testnet →
            </a>
          ) : (
            <button
              type="button"
              disabled
              title="No live session configured — this is illustrative data, not a real on-chain wallet to inspect"
              className="font-data text-xs uppercase tracking-wider border border-stone-line text-ink-faint px-4 py-2.5 cursor-not-allowed"
            >
              View session wallet on-chain →
            </button>
          )}
        </section>

        <section className="max-w-4xl mx-auto px-5 sm:px-8 pb-16 sm:pb-20 border-t border-stone-line pt-16 sm:pt-20">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-data text-xs uppercase tracking-wider text-bronze-text">
              Clause 0(b) — Liquidity check
            </span>
            <span
              className={`font-data text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
                liquidityCheck.breached
                  ? "border-stamp text-stamp"
                  : "border-verdigris text-verdigris"
              }`}
            >
              {liquidityCheck.breached ? "● No live pool found" : "● Pool is live"}
            </span>
          </div>
          <h2 className="font-display text-3xl mb-4">Meridian Rebalancer&rsquo;s pool, checked live</h2>
          <p className="font-body text-ink-soft max-w-2xl mb-4">
            A read-only, honest signal — whether a PancakeSwap v3 WBNB/USDT pool with real
            liquidity currently exists at all. This is informational only: it doesn&rsquo;t decide
            who gets paid (see Clause 0(c) below for that).
          </p>
          <p className="font-data text-xs text-ink-faint max-w-2xl">{liquidityCheck.reason}</p>
        </section>

        <section className="max-w-4xl mx-auto px-5 sm:px-8 pb-16 sm:pb-20 border-t border-stone-line pt-16 sm:pt-20">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-data text-xs uppercase tracking-wider text-bronze-text">
              Clause 0(c) — Band breach payouts
            </span>
            <span
              className={`font-data text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
                bandBreachCheck.breached ? "border-stamp text-stamp" : "border-verdigris text-verdigris"
              }`}
            >
              {bandBreachCheck.breached ? "● Breach condition met" : "● No breach"}
            </span>
          </div>
          <h2 className="font-display text-3xl mb-4">What actually pays a rebate</h2>
          <p className="font-body text-ink-soft max-w-2xl mb-4">
            Every 30 minutes, an unattended job checks every real, on-chain agent&rsquo;s assurance
            band and pays a real rebate — from the session above, to the actual hirer&rsquo;s
            wallet — for every real hire against a breached agent that hasn&rsquo;t been rebated
            yet. This page runs the identical check on every load.
          </p>
          <p className="font-data text-xs text-ink-faint max-w-2xl">{bandBreachCheck.reason}</p>
        </section>

        <section className="max-w-4xl mx-auto px-5 sm:px-8 pb-20 sm:pb-28 border-t border-stone-line pt-16 sm:pt-20">
          <span className="font-data text-xs uppercase tracking-wider text-bronze-text block mb-3">
            Clause 1 — Ledger
          </span>
          <h2 className="font-display text-3xl mb-8">Backstop in action</h2>
          <div className="border-t border-stone-line">
            {realRebates.map((r) => (
              <div
                key={r.id}
                className="grid sm:grid-cols-[1fr_auto] gap-x-6 gap-y-2 py-5 border-b border-stone-line"
              >
                <div className="flex gap-3">
                  <span className="text-stamp shrink-0" aria-hidden="true">
                    ⚠
                  </span>
                  <div>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                      <span className="font-display text-lg">{r.agentName}</span>
                      <span className="font-data text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-verdigris text-verdigris">
                        ● Real payout
                      </span>
                    </div>
                    <p className="font-body text-sm text-ink-soft">{r.reason}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-data text-sm tabnum">{formatUnits(BigInt(r.amountRaw), 18)} U rebate</div>
                  <div className="font-data text-[11px] text-ink-faint tabnum">
                    {new Date(r.paidAt).toLocaleString()}
                  </div>
                  {r.txHash && (
                    <a
                      href={`https://testnet.bscscan.com/tx/${r.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-data text-[11px] text-bronze-text underline underline-offset-2"
                    >
                      {r.txHash.slice(0, 10)}…
                    </a>
                  )}
                </div>
              </div>
            ))}
            {REBATE_LOG.map((r) => (
              <div
                key={r.id}
                className="grid sm:grid-cols-[1fr_auto] gap-x-6 gap-y-2 py-5 border-b border-stone-line"
              >
                <div className="flex gap-3">
                  <span className="text-stamp shrink-0" aria-hidden="true">
                    ⚠
                  </span>
                  <div>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                      <span className="font-display text-lg">{r.agent}</span>
                      <span className="font-data text-[10px] uppercase tracking-wider text-ink-faint">
                        {r.category}
                      </span>
                      <span className="font-data text-[10px] uppercase tracking-wider text-bronze-text">
                        {r.clause}
                      </span>
                      <span className="font-data text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-stone-line text-ink-faint">
                        Illustrative
                      </span>
                    </div>
                    <p className="font-body text-sm text-ink-soft">{r.reason}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-data text-sm tabnum">{r.amount} rebate</div>
                  <div className="font-data text-[11px] text-ink-faint tabnum">{r.time}</div>
                  <div className="font-data text-[11px] text-ink-faint">{r.txHash}</div>
                </div>
              </div>
            ))}
            {cleanEntries.map((a) => (
              <div
                key={a.id}
                className="grid sm:grid-cols-[1fr_auto] gap-x-6 gap-y-2 py-5 border-b border-stone-line"
              >
                <div className="flex gap-3">
                  <span className="text-verdigris shrink-0" aria-hidden="true">
                    ✓
                  </span>
                  <div>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                      <span className="font-display text-lg">{a.name}</span>
                      <span className="font-data text-[10px] uppercase tracking-wider text-ink-faint">
                        {CATEGORIES.find((c) => c.id === a.category)?.label}
                      </span>
                    </div>
                    <p className="font-body text-sm text-ink-soft">
                      Realized {a.band.realized}
                      {a.band.symbol} {a.band.unit} — inside the promised band, no rebate needed
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-data text-sm tabnum text-ink-faint">no payout</div>
                  <div className="font-data text-[11px] text-ink-faint tabnum">{a.band.cycleLabel}</div>
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
      <div className="font-data text-[10px] uppercase tracking-wider text-ink-faint mb-2">
        {label}
      </div>
      <div className="font-display text-2xl sm:text-3xl mb-1.5 tabnum">{value}</div>
      <div className="font-body text-xs text-ink-soft leading-snug">{note}</div>
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
