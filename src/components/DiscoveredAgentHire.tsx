"use client";

import { useState, useTransition } from "react";
import { useAccount, useSignMessage } from "wagmi";
import type { DiscoveredAgent } from "@/lib/erc8004";
import { hireAgentOnChain, type HireResult } from "@/lib/chain/hireAgent";
import { buildHireAuthMessage } from "@/lib/chain/hireAuthMessage";
import { recordHire } from "@/lib/chain/hires";
import { SettleJobButton } from "./SettleJobButton";

type TrackStatus = "idle" | "signing" | "recorded" | "skipped" | "error";

/**
 * Hires any agent discovered directly from the live ERC-8004 registry (see
 * DiscoveredAgents.tsx), not just Backstop's own curated roster. Opens a
 * real ERC-8183 job funded straight to the agent's real onchain owner
 * address, on whichever chain it's actually registered on (testnet or
 * mainnet) — the same real createJob -> registerJob -> fund flow HireFlow.tsx
 * uses for a catalog agent, just parametrized by network instead of always
 * bsc-testnet.
 *
 * The honesty gap here is structural, not a bug: Backstop can verify a
 * discovered agent's *identity* (it's really registered on ERC-8004) but has
 * no way to verify it's actually *listening* for ERC-8183 jobs the way its
 * own 5 catalog agents are confirmed to be. A funded job against an agent
 * that never fulfills it will simply sit in FUNDED — that risk is disclosed
 * inline, not hidden, and there's deliberately no assurance band or pool
 * coverage offered for a hire made this way.
 */
export function DiscoveredAgentHire({ agent }: { agent: DiscoveredAgent }) {
  const [open, setOpen] = useState(false);
  const [budget, setBudget] = useState("100");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<HireResult | null>(null);
  const [trackStatus, setTrackStatus] = useState<TrackStatus>("idle");
  const [trackError, setTrackError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const isMainnet = agent.network === "bsc-mainnet";
  const explorerLabel = isMainnet ? "BscScan" : "BscScan Testnet";

  function begin() {
    startTransition(async () => {
      const res = await hireAgentOnChain(agent.ownerAddress, budget, agent.network);
      setResult(res);

      if (res.mode === "live" && res.ok) {
        if (!isConnected || !address) {
          setTrackStatus("skipped");
          return;
        }
        setTrackStatus("signing");
        try {
          const message = buildHireAuthMessage({
            agentId: agent.agentId,
            agentName: agent.name,
            budgetHuman: budget,
            walletAddress: address,
          });
          const signature = await signMessageAsync({ message });
          const recorded = await recordHire({
            walletAddress: address,
            agentId: agent.agentId,
            agentName: agent.name,
            budgetHuman: budget,
            jobId: res.jobId,
            txHash: res.txHash,
            mode: "live",
            message,
            signature,
          });
          if (recorded.ok) {
            setTrackStatus("recorded");
          } else {
            setTrackStatus("error");
            setTrackError(recorded.error ?? "Couldn't record this hire.");
          }
        } catch {
          setTrackStatus("error");
          setTrackError("Signature was declined. This hire won't appear in My Agents.");
        }
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="font-data text-[11px] uppercase tracking-wider px-3 py-2 border border-paper-line hover:border-bronze-text hover:text-bronze-text transition-colors"
      >
        Hire →
      </button>
    );
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="mt-1 border-t border-paper-line pt-4"
    >
      <p className="font-data text-[10px] text-paper-ink-faint leading-relaxed mb-3">
        Not part of Backstop&rsquo;s underwritten roster: no assurance band, no pool coverage.
        This funds a real ERC-8183 job directly to{" "}
        <span className="text-paper-ink">
          {agent.ownerAddress.slice(0, 6)}…{agent.ownerAddress.slice(-4)}
        </span>{" "}
        on {isMainnet ? "BSC Mainnet" : "BSC Testnet"}. Whether it&rsquo;s ever fulfilled depends
        entirely on that operator, Backstop has no way to confirm it&rsquo;s listening.
      </p>
      {isMainnet && !result && (
        <p className="font-data text-[10px] text-stamp leading-relaxed mb-3">
          Mainnet: this spends a real balance and pays real gas. No sponsored writes, no test
          tokens, no undo.
        </p>
      )}

      {!result && (
        <div className="flex items-center gap-2 mb-1">
          <input
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            inputMode="decimal"
            aria-label="Budget"
            className="w-24 font-data text-sm bg-paper border border-paper-line px-2.5 py-2 tabnum focus-visible:outline-2 focus-visible:outline-bronze"
          />
          <span className="font-data text-[11px] text-paper-ink-faint">U</span>
          <button
            type="button"
            disabled={pending}
            onClick={begin}
            className="ml-auto font-data text-[11px] uppercase tracking-wider px-3 py-2 rounded-lg bg-paper-ink text-paper hover:bg-bronze-text transition-colors disabled:opacity-50 disabled:cursor-wait"
          >
            {pending ? "Funding…" : "Sign & fund job →"}
          </button>
        </div>
      )}

      {result && (
        <div className="mt-2">
          {result.ok ? (
            <div className="space-y-1.5">
              <p className="font-data text-[11px] uppercase tracking-wider text-bronze-text mb-1">
                Confirmed on {isMainnet ? "BSC Mainnet" : "BSC Testnet"}
              </p>
              <p className="font-data text-[12px] text-paper-ink tabnum">
                Job #{result.jobId} · {result.status} · {budget} U
              </p>
              {result.explorerUrl && (
                <a
                  href={result.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block font-data text-[11px] text-bronze-text underline underline-offset-2"
                >
                  View transaction on {explorerLabel} →
                </a>
              )}
              <TrackingStatus status={trackStatus} error={trackError} />
              {result.jobId && (
                <div className="pt-3 mt-1 border-t border-paper-line">
                  <SettleJobButton jobId={result.jobId} network={agent.network} />
                </div>
              )}
            </div>
          ) : (
            <p className="text-[12px] text-stamp leading-relaxed">{result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}

function TrackingStatus({ status, error }: { status: TrackStatus; error: string | null }) {
  switch (status) {
    case "signing":
      return <p className="font-data text-[11px] text-paper-ink-faint">Awaiting wallet signature to track this hire…</p>;
    case "recorded":
      return <p className="font-data text-[11px] text-verdigris">Added to My Agents →</p>;
    case "skipped":
      return (
        <p className="font-data text-[11px] text-paper-ink-faint">
          Connect a wallet before hiring to have this show up in My Agents.
        </p>
      );
    case "error":
      return <p className="font-data text-[11px] text-stamp">{error}</p>;
    default:
      return null;
  }
}
