"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { getHiresForWallet, type HireRecord } from "@/lib/chain/hires";
import { getAgent } from "@/lib/agents";
import { formatUnits } from "viem";
import { projectId } from "@/lib/wallet/config";
import { SettleJobButton } from "@/components/SettleJobButton";

export default function MyAgentsPage() {
  const { address, isConnected } = useAccount();
  const [hires, setHires] = useState<HireRecord[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchHires = address ? getHiresForWallet(address) : Promise.resolve(null);
    fetchHires.then((rows) => {
      if (!cancelled) setHires(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [address]);

  return (
    <>
      <Header />
      <main>
        <section data-tone="dark" className="relative overflow-hidden bg-[var(--color-momento-bg)]">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_20%_0%,_var(--color-momento-blue)_0%,_var(--color-momento-bg-deep)_45%,_var(--color-momento-bg)_100%)] opacity-80"
            aria-hidden="true"
          />
          <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 pt-32 sm:pt-40 pb-14 sm:pb-16">
            <span className="font-data text-xs uppercase tracking-wider text-bronze-bright">
              Your workforce
            </span>
            <h1 className="font-forum text-white text-4xl sm:text-5xl mt-2 mb-4">My Agents</h1>
            <p className="font-body text-white/60 max-w-xl">
              Real hire records, signed by your wallet, not a fabricated live feed. Each entry
              links to the actual onchain transaction where one exists.
            </p>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        {!isConnected && (
          <div className="border border-paper-line bg-paper-raised/50 p-8 text-center">
            <p className="font-body text-paper-ink-soft mb-5">
              Connect your wallet to see agents you&rsquo;ve hired.
            </p>
            <div className="flex justify-center">
              <ConnectWalletButton />
            </div>
            {!projectId && (
              // The button above is disabled with only a hover `title` to
              // explain why (not discoverable on touch devices, and easy to
              // miss even on desktop) — this page has room to just say it
              // outright, unlike the header's cramped nav slot.
              <p className="mt-4 font-data text-[11px] text-paper-ink-faint">
                Wallet connect isn&rsquo;t configured for this deployment (missing
                NEXT_PUBLIC_REOWN_PROJECT_ID).
              </p>
            )}
          </div>
        )}

        {isConnected && hires === null && (
          <p className="font-data text-[13px] text-paper-ink-faint">Loading…</p>
        )}

        {isConnected && hires !== null && hires.length === 0 && (
          <div className="border border-paper-line bg-paper-raised/50 p-8 text-center">
            <p className="font-body text-paper-ink-soft mb-5 max-w-md mx-auto">
              No hires recorded yet for this wallet. Hiring an agent while connected signs a real
              authorization message that lands here.
            </p>
            <Link
              href="/marketplace"
              className="inline-block font-data text-xs uppercase tracking-wider px-5 py-3 rounded-lg bg-paper-ink text-paper hover:bg-bronze-text transition-colors"
            >
              Enter the marketplace →
            </Link>
          </div>
        )}

        {isConnected && hires !== null && hires.length > 0 && (
          <div className="space-y-5">
            {hires.map((h) => (
              <HireCard key={h.id} hire={h} />
            ))}
          </div>
        )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function HireCard({ hire }: { hire: HireRecord }) {
  const agent = getAgent(hire.agentId);
  // A discovered-agent hire's agentId is the real ERC-8004 id itself,
  // shaped "<chainId>:<contract>:<tokenId>" (see DiscoveredAgentHire.tsx) —
  // no catalog lookup exists for these, so the chain and a display name are
  // recovered from the id itself and the agent_name snapshot taken at hire
  // time, rather than hiding the row entirely.
  const chainId = agent ? 97 : Number(hire.agentId.split(":")[0]) || 97;
  const isMainnet = chainId === 56;
  const network = isMainnet ? "bsc-mainnet" : "bsc-testnet";
  const explorerBase = isMainnet ? "https://bscscan.com" : "https://testnet.bscscan.com";
  const displayName = agent?.name ?? hire.agentName ?? "Unregistered agent";
  const hiredAt = new Date(hire.createdAt);
  // Derived from this specific hire's real `rebates` row, never from the
  // agent's static/illustrative band.status — a real rebate claim requires
  // a real payout tied to *this* hire, not just this agent's demo data.
  const statusLabel = hire.rebatePaid ? "Rebate paid" : "Hired, cycle in progress";
  const statusClassName = hire.rebatePaid ? "text-stamp" : "text-paper-ink-faint";

  return (
    <div className="border border-paper-line bg-paper-raised/50 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
        {agent ? (
          <Link
            href={`/agents/${agent.id}`}
            className="font-display text-xl hover:text-bronze-text transition-colors"
          >
            {displayName}
          </Link>
        ) : (
          <a
            href={`https://www.8004scan.io/agent/${hire.agentId}`}
            target="_blank"
            rel="noreferrer"
            className="font-display text-xl hover:text-bronze-text transition-colors"
          >
            {displayName}
          </a>
        )}
        <span className="font-data text-[10px] uppercase tracking-wider text-paper-ink-faint tabnum">
          Hired {hiredAt.toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 font-data text-[12px] mb-4">
        <div>
          <span className="block text-paper-ink-faint text-[10px] uppercase tracking-wider mb-1">
            Budget
          </span>
          <span className="tabnum">{hire.budgetHuman} U</span>
        </div>
        <div>
          <span className="block text-paper-ink-faint text-[10px] uppercase tracking-wider mb-1">
            Job
          </span>
          <span className="tabnum">{hire.jobId ? `#${hire.jobId}` : "N/A"}</span>
        </div>
        <div>
          <span className="block text-paper-ink-faint text-[10px] uppercase tracking-wider mb-1">
            Current cycle
          </span>
          <span className={`uppercase tracking-wider ${statusClassName}`}>{statusLabel}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1">
        {hire.txHash && (
          <a
            href={`${explorerBase}/tx/${hire.txHash}`}
            target="_blank"
            rel="noreferrer"
            className="font-data text-[11px] text-bronze-text underline underline-offset-2"
          >
            View hire transaction on BscScan →
          </a>
        )}
        {hire.rebatePaid && hire.rebateTxHash && (
          <a
            href={`${explorerBase}/tx/${hire.rebateTxHash}`}
            target="_blank"
            rel="noreferrer"
            className="font-data text-[11px] text-stamp underline underline-offset-2"
          >
            View {hire.rebateAmountRaw ? `${formatUnits(BigInt(hire.rebateAmountRaw), 18)} U ` : ""}
            rebate transaction on BscScan →
          </a>
        )}
      </div>

      {hire.mode === "live" && hire.jobId && (
        <div className="mt-4 pt-4 border-t border-paper-line">
          <SettleJobButton jobId={hire.jobId} network={network} />
        </div>
      )}

      {agent ? (
        <p className="font-body text-[12px] text-paper-ink-faint mt-4 pt-4 border-t border-paper-line leading-relaxed">
          Covered by Backstop&rsquo;s assurance pool, {agent.poolContribution} of every fee{" "}
          {agent.name} earns funds it. Executed via Backstop&rsquo;s demo signer; your wallet
          authorized this record.
        </p>
      ) : (
        <p className="font-body text-[12px] text-paper-ink-faint mt-4 pt-4 border-t border-paper-line leading-relaxed">
          Discovered via the live ERC-8004 registry, not part of Backstop&rsquo;s underwritten
          roster: no assurance band, no pool coverage. Your wallet authorized this record; the job
          itself is between you and this agent&rsquo;s operator directly.
        </p>
      )}
    </div>
  );
}
