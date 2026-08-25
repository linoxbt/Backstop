"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { getHiresForWallet, type HireRecord } from "@/lib/chain/hires";
import { getAgent } from "@/lib/agents";
import type { Agent } from "@/lib/types";

const STATUS_META: Record<Agent["band"]["status"], { label: string; className: string }> = {
  within: { label: "On track", className: "text-verdigris" },
  breach: { label: "Rebate paid", className: "text-stamp" },
  pending: { label: "Pending", className: "text-ink-faint" },
};

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
      <main className="max-w-3xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <span className="font-data text-xs uppercase tracking-wider text-bronze-text">
          Your workforce
        </span>
        <h1 className="font-display text-4xl sm:text-5xl mt-2 mb-4">My Agents</h1>
        <p className="font-body text-ink-soft max-w-xl mb-10">
          Real hire records, signed by your wallet — not a fabricated live feed. Each entry links
          to the actual on-chain transaction where one exists.
        </p>

        {!isConnected && (
          <div className="border border-stone-line bg-stone-raised/50 p-8 text-center">
            <p className="font-body text-ink-soft mb-5">
              Connect your wallet to see agents you&rsquo;ve hired.
            </p>
            <div className="flex justify-center">
              <ConnectWalletButton />
            </div>
          </div>
        )}

        {isConnected && hires === null && (
          <p className="font-data text-[13px] text-ink-faint">Loading…</p>
        )}

        {isConnected && hires !== null && hires.length === 0 && (
          <div className="border border-stone-line bg-stone-raised/50 p-8 text-center">
            <p className="font-body text-ink-soft mb-5 max-w-md mx-auto">
              No hires recorded yet for this wallet. Hiring an agent while connected signs a real
              authorization message that lands here.
            </p>
            <Link
              href="/marketplace"
              className="inline-block font-data text-xs uppercase tracking-wider px-5 py-3 bg-ink text-stone hover:bg-bronze-text transition-colors"
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
      </main>
      <Footer />
    </>
  );
}

function HireCard({ hire }: { hire: HireRecord }) {
  const agent = getAgent(hire.agentId);
  if (!agent) return null;
  const meta = STATUS_META[agent.band.status];
  const hiredAt = new Date(hire.createdAt);

  return (
    <div className="border border-stone-line bg-stone-raised/50 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
        <Link
          href={`/agents/${agent.id}`}
          className="font-display text-xl hover:text-bronze-text transition-colors"
        >
          {agent.name}
        </Link>
        <span className="font-data text-[10px] uppercase tracking-wider text-ink-faint tabnum">
          Hired {hiredAt.toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 font-data text-[12px] mb-4">
        <div>
          <span className="block text-ink-faint text-[10px] uppercase tracking-wider mb-1">
            Budget
          </span>
          <span className="tabnum">{hire.budgetHuman} U</span>
        </div>
        <div>
          <span className="block text-ink-faint text-[10px] uppercase tracking-wider mb-1">
            Job
          </span>
          <span className="tabnum">{hire.jobId ? `#${hire.jobId}` : "—"}</span>
        </div>
        <div>
          <span className="block text-ink-faint text-[10px] uppercase tracking-wider mb-1">
            Current cycle
          </span>
          <span className={`uppercase tracking-wider ${meta.className}`}>{meta.label}</span>
        </div>
      </div>

      {hire.txHash && (
        <a
          href={`https://testnet.bscscan.com/tx/${hire.txHash}`}
          target="_blank"
          rel="noreferrer"
          className="font-data text-[11px] text-bronze-text underline underline-offset-2"
        >
          View hire transaction on BscScan →
        </a>
      )}

      <p className="font-body text-[12px] text-ink-faint mt-4 pt-4 border-t border-stone-line leading-relaxed">
        Covered by Backstop&rsquo;s assurance pool — {agent.poolContribution} of every fee{" "}
        {agent.name} earns funds it. Executed via Backstop&rsquo;s demo signer; your wallet
        authorized this record.
      </p>
    </div>
  );
}
