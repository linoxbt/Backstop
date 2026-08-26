import Link from "next/link";
import { formatUnits } from "viem";
import { AGENTS, CATEGORIES } from "@/lib/agents";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { POOL, REBATE_LOG } from "@/lib/pool";
import { getPoolSessionInfo, getPoolBalance } from "@/lib/wallet/altanaPool";
import { checkRebalancerBreach } from "@/lib/chain/rebalanceBreach";
import { checkAgentBandBreaches } from "@/lib/chain/bandBreach";
import { getRecentRebates, getTotalRebateStats } from "@/lib/chain/rebates";
import { getRealHireStatsForAllAgents } from "@/lib/chain/hires";

// This page's own copy claims "This page runs the identical check on every
// load" and shows a live "● Pool is live" badge — without this, Next's
// automatic static optimization would prerender the page once at build
// time (none of the awaited calls below use a dynamic API like cookies() or
// headers(), so nothing else would have told it not to), freezing every one
// of those "live" reads until the next deploy. getLivePoolState itself is
// still cached for 30s (see src/lib/pancakeswap.ts) so this doesn't turn
// into an RPC call on every single request.
export const dynamic = "force-dynamic";

const SHADE = ["bg-paper-ink", "bg-bronze-text", "bg-verdigris", "bg-paper-ink-soft"];

export default async function PoolPage() {
  const [session, liquidityCheck, bandBreachCheck, realRebates, rebateTotals, volumeByAgent] =
    await Promise.all([
      getPoolSessionInfo(),
      checkRebalancerBreach(),
      Promise.resolve(checkAgentBandBreaches()),
      getRecentRebates(),
      getTotalRebateStats(),
      getRealHireStatsForAllAgents(),
    ]);
  // The pool balance read needs the session's real wallet address, which
  // only exists once getPoolSessionInfo() above has resolved — can't join
  // this into the same Promise.all.
  const poolBalance =
    session.configured && session.walletAddress
      ? await getPoolBalance(session.walletAddress as `0x${string}`)
      : null;
  const totalRealVolume = volumeByAgent.reduce((sum, v) => sum + v.realVolume, 0);
  const realPayoutRatio = totalRealVolume > 0 ? (rebateTotals.totalAmount / totalRealVolume) * 100 : null;

  const totalHirers = AGENTS.reduce((sum, a) => sum + a.hirers, 0);
  const cleanEntries = AGENTS.filter((a) => a.band.status === "within");

  return (
    <>
      <Header />
      <main>
        <section data-tone="dark" className="relative overflow-hidden bg-[var(--color-momento-bg)]">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_0%,_var(--color-momento-blue)_0%,_var(--color-momento-bg-deep)_45%,_var(--color-momento-bg)_100%)] opacity-80"
            aria-hidden="true"
          />
          <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 pt-32 sm:pt-40 pb-16 sm:pb-24 text-center">
            <span className="font-data text-xs uppercase tracking-[0.2em] text-bronze-bright">
              The reserve
            </span>
            <div className="font-forum text-white text-5xl sm:text-6xl mt-4 mb-2 tabnum">
              {poolBalance ? `${Number(poolBalance.formatted).toLocaleString()} ${poolBalance.symbol}` : POOL.tvl}
            </div>
            <p className="font-body text-white/60 mb-2">
              protecting agent jobs across {AGENTS.length} agents, {CATEGORIES.length} categories
            </p>
            <p className="font-data text-[11px] text-white/30 uppercase tracking-wider mb-10">
              {poolBalance ? "Real balance, session wallet" : "Illustrative figure, no live session configured"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-10 max-w-xl mx-auto text-left">
              <Stat
                label="Payout ratio"
                value={realPayoutRatio !== null ? `${realPayoutRatio.toFixed(1)}%` : POOL.payoutRatio}
                note={realPayoutRatio !== null ? "real, against real hire volume" : `${POOL.payoutRatioNote} (illustrative)`}
                dark
              />
              <Stat
                label="Solvency buffer"
                value={POOL.solvencyBuffer}
                note={`${POOL.solvencyBufferNote} (illustrative)`}
                dark
              />
              <Stat
                label="Rebates paid"
                value={`${rebateTotals.totalAmount.toLocaleString()} U`}
                note={`${rebateTotals.count} real payouts to date`}
                dark
              />
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <span className="font-data text-xs uppercase tracking-wider text-bronze-text block mb-3">
            What it protects
          </span>
          <h2 className="font-display text-3xl mb-6">Protection by category</h2>
          <p className="font-body text-paper-ink-soft max-w-2xl mb-6">
            Weighted by hirers per category, where the pool&rsquo;s obligation is actually
            concentrated, not an invented dollar split.
          </p>
          <div className="flex h-3 w-full overflow-hidden border border-paper-line mb-3">
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
          <div className="flex flex-wrap gap-x-5 gap-y-2 font-data text-[11px] text-paper-ink-soft">
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

        <section className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-20 border-t border-paper-line">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-data text-xs uppercase tracking-wider text-bronze-text">
              Clause 0, Session authority
            </span>
            <span
              className={`font-data text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
                session.configured
                  ? "border-verdigris text-verdigris"
                  : "border-paper-line text-paper-ink-faint"
              }`}
            >
              {session.configured ? "● Live session" : "Illustrative"}
            </span>
          </div>
          <h2 className="font-display text-3xl mb-6">The session that pays you</h2>
          <p className="font-body text-paper-ink-soft max-w-2xl mb-8">
            An Altana smart wallet, scoped to exactly this.
          </p>
          <div className="border border-paper-line bg-paper-raised/50 p-6 sm:p-8 grid sm:grid-cols-2 gap-6 mb-6">
            {session.configured ? (
              <>
                <Field label="Call allowlist" value={(session.callAllowlist ?? []).join(", ")} mono />
                <Field label="Spend cap" value={session.spendCap ?? "N/A"} mono />
                <Field
                  label="Expiry"
                  value={session.expiry ? new Date(session.expiry * 1000).toISOString() : "N/A"}
                />
                <Field label="Registered in" value="Altana Keystore" />
                <Field label="Session wallet" value={session.walletAddress ?? "N/A"} mono />
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
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://testnet.altana.network/account/${session.walletAddress}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block font-data text-xs uppercase tracking-wider border border-paper-ink px-4 py-2.5 hover:bg-paper-ink hover:text-paper transition-colors"
              >
                View wallet onchain on Altana Explorer →
              </a>
              <a
                href={`https://testnet.bscscan.com/address/${session.walletAddress}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block font-data text-xs uppercase tracking-wider border border-paper-line text-paper-ink-soft px-4 py-2.5 hover:border-paper-ink hover:text-paper-ink transition-colors"
              >
                View on BscScan Testnet →
              </a>
            </div>
          ) : (
            <button
              type="button"
              disabled
              title="No live session configured. This is illustrative data, not a real onchain wallet to inspect"
              className="font-data text-xs uppercase tracking-wider border border-paper-line text-paper-ink-faint px-4 py-2.5 cursor-not-allowed"
            >
              View wallet onchain on Altana Explorer →
            </button>
          )}
        </section>

        <section className="max-w-4xl mx-auto px-5 sm:px-8 pb-16 sm:pb-20 border-t border-paper-line pt-16 sm:pt-20">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-data text-xs uppercase tracking-wider text-bronze-text">
              Clause 0(b), Liquidity check
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
          <p className="font-body text-paper-ink-soft max-w-2xl mb-4">
            A read-only, honest signal: whether a PancakeSwap v3 WBNB/USDT pool with real
            liquidity currently exists at all. This is informational only: it doesn&rsquo;t decide
            who gets paid (see Clause 0(c) below for that).
          </p>
          <p className="font-data text-xs text-paper-ink-faint max-w-2xl">{liquidityCheck.reason}</p>
        </section>

        <section className="max-w-4xl mx-auto px-5 sm:px-8 pb-16 sm:pb-20 border-t border-paper-line pt-16 sm:pt-20">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-data text-xs uppercase tracking-wider text-bronze-text">
              Clause 0(c), Band breach payouts
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
          <p className="font-body text-paper-ink-soft max-w-2xl mb-4">
            Every 30 minutes, an unattended job checks every real, onchain agent&rsquo;s assurance
            band and pays a real rebate, from the session above, to the actual hirer&rsquo;s
            wallet, for every real hire against a breached agent that hasn&rsquo;t been rebated
            yet. This page runs the identical check on every load.
          </p>
          <p className="font-data text-xs text-paper-ink-faint max-w-2xl">{bandBreachCheck.reason}</p>
        </section>

        <section className="max-w-4xl mx-auto px-5 sm:px-8 pb-20 sm:pb-28 border-t border-paper-line pt-16 sm:pt-20">
          <span className="font-data text-xs uppercase tracking-wider text-bronze-text block mb-3">
            Clause 1, Ledger
          </span>
          <h2 className="font-display text-3xl mb-8">Backstop in action</h2>
          <p className="font-data text-[11px] text-paper-ink-faint mb-4">
            Every entry below opens a full detail page.
          </p>
          <div className="border-t border-paper-line">
            {realRebates.map((r) => (
              <Link
                key={r.id}
                href={`/pool/rebates/${r.id}`}
                className="grid sm:grid-cols-[1fr_auto] gap-x-6 gap-y-2 py-5 border-b border-paper-line hover:bg-paper-raised/40 transition-colors"
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
                    <p className="font-body text-sm text-paper-ink-soft">{r.reason}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-data text-sm tabnum">{formatUnits(BigInt(r.amountRaw), 18)} U rebate</div>
                  <div className="font-data text-[11px] text-paper-ink-faint tabnum">
                    {new Date(r.paidAt).toLocaleString()}
                  </div>
                  {r.txHash && (
                    <span className="font-data text-[11px] text-bronze-text underline underline-offset-2">
                      {r.txHash.slice(0, 10)}…
                    </span>
                  )}
                </div>
              </Link>
            ))}
            {REBATE_LOG.map((r) => (
              <Link
                key={r.id}
                href={`/pool/rebates/${r.id}`}
                className="grid sm:grid-cols-[1fr_auto] gap-x-6 gap-y-2 py-5 border-b border-paper-line hover:bg-paper-raised/40 transition-colors"
              >
                <div className="flex gap-3">
                  <span className="text-stamp shrink-0" aria-hidden="true">
                    ⚠
                  </span>
                  <div>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                      <span className="font-display text-lg">{r.agent}</span>
                      <span className="font-data text-[10px] uppercase tracking-wider text-paper-ink-faint">
                        {r.category}
                      </span>
                      <span className="font-data text-[10px] uppercase tracking-wider text-bronze-text">
                        {r.clause}
                      </span>
                      <span className="font-data text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-paper-line text-paper-ink-faint">
                        Illustrative
                      </span>
                    </div>
                    <p className="font-body text-sm text-paper-ink-soft">{r.reason}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-data text-sm tabnum">{r.amount} rebate</div>
                  <div className="font-data text-[11px] text-paper-ink-faint tabnum">{r.time}</div>
                  <div className="font-data text-[11px] text-paper-ink-faint">{r.txHash}</div>
                </div>
              </Link>
            ))}
            {cleanEntries.map((a) => (
              <Link
                key={a.id}
                href={`/agents/${a.id}`}
                className="grid sm:grid-cols-[1fr_auto] gap-x-6 gap-y-2 py-5 border-b border-paper-line hover:bg-paper-raised/40 transition-colors"
              >
                <div className="flex gap-3">
                  <span className="text-verdigris shrink-0" aria-hidden="true">
                    ✓
                  </span>
                  <div>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                      <span className="font-display text-lg">{a.name}</span>
                      <span className="font-data text-[10px] uppercase tracking-wider text-paper-ink-faint">
                        {CATEGORIES.find((c) => c.id === a.category)?.label}
                      </span>
                    </div>
                    <p className="font-body text-sm text-paper-ink-soft">
                      Realized {a.band.realized}
                      {a.band.symbol} {a.band.unit}, inside the promised band, no rebate needed
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-data text-sm tabnum text-paper-ink-faint">no payout</div>
                  <div className="font-data text-[11px] text-paper-ink-faint tabnum">{a.band.cycleLabel}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Stat({
  label,
  value,
  note,
  dark = false,
}: {
  label: string;
  value: string;
  note: string;
  dark?: boolean;
}) {
  return (
    <div>
      <div
        className={`font-data text-[10px] uppercase tracking-wider mb-2 ${dark ? "text-white/40" : "text-paper-ink-faint"}`}
      >
        {label}
      </div>
      <div
        className={`font-display text-2xl sm:text-3xl mb-1.5 tabnum ${dark ? "text-white" : ""}`}
      >
        {value}
      </div>
      <div className={`font-body text-xs leading-snug ${dark ? "text-white/60" : "text-paper-ink-soft"}`}>
        {note}
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="font-data text-[10px] uppercase tracking-wider text-paper-ink-faint mb-1">
        {label}
      </div>
      <div className={mono ? "font-data text-sm break-all" : "font-body text-sm"}>{value}</div>
    </div>
  );
}
