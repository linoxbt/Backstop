"use client";

import { useState, useTransition } from "react";
import { useAccount, useSignMessage } from "wagmi";
import type { Agent } from "@/lib/types";
import { hireAgentOnChain, type HireResult } from "@/lib/chain/hireAgent";
import { buildHireAuthMessage } from "@/lib/chain/hireAuthMessage";
import { recordHire } from "@/lib/chain/hires";

type Stage = "idle" | "pending" | "done";
type TrackStatus = "idle" | "signing" | "recorded" | "skipped" | "error";

const SIM_STAGES = [
  { key: "open", label: "Job opened — terms committed" },
  { key: "funded", label: "Funded — manifest hash locked on-chain" },
];

export function HireFlow({ agent }: { agent: Agent }) {
  const [stage, setStage] = useState<Stage>("idle");
  const [budget, setBudget] = useState("2,500");
  const [result, setResult] = useState<HireResult | null>(null);
  const [simStep, setSimStep] = useState<0 | 1 | 2>(0);
  const [trackStatus, setTrackStatus] = useState<TrackStatus>("idle");
  const [trackError, setTrackError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const started = stage !== "idle";

  function begin() {
    setStage("pending");
    startTransition(async () => {
      const res = await hireAgentOnChain(agent.providerAddress, budget);
      setResult(res);
      if (res.mode === "simulated") {
        setSimStep(1);
        window.setTimeout(() => setSimStep(2), 900);
        window.setTimeout(() => setStage("done"), 1700);
      } else {
        setStage("done");
      }

      // Track the hire in "My Agents" — only for a real, confirmed hire,
      // and only if a wallet is connected to sign the authorization.
      if (res.mode === "live" && res.ok) {
        if (!isConnected || !address) {
          setTrackStatus("skipped");
          return;
        }
        setTrackStatus("signing");
        try {
          const message = buildHireAuthMessage({
            agentId: agent.id,
            agentName: agent.name,
            budgetHuman: budget,
            walletAddress: address,
          });
          const signature = await signMessageAsync({ message });
          const recorded = await recordHire({
            walletAddress: address,
            agentId: agent.id,
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
          setTrackError("Signature was declined — this hire won't appear in My Agents.");
        }
      }
    });
  }

  return (
    <div className="border border-paper-line bg-paper-raised/50 p-5 sm:p-7">
      <span className="font-data text-[11px] uppercase tracking-wider text-bronze-text">
        Get started
      </span>
      <h3 className="font-display text-xl mt-1 mb-4">Hire {agent.name}</h3>

      {!started && (
        <>
          <label className="block font-data text-[11px] uppercase tracking-wider text-paper-ink-faint mb-1.5">
            Position budget (U)
          </label>
          <input
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            inputMode="decimal"
            className="w-full font-data text-lg bg-paper border border-paper-line px-3 py-2.5 mb-4 tabnum focus-visible:outline-2 focus-visible:outline-bronze"
          />
          <p className="text-[12px] text-paper-ink-faint mb-5 font-data">
            Altana session, scoped to {agent.name} · {agent.poolContribution} to the pool
          </p>
          <button
            onClick={begin}
            className="w-full font-data text-xs uppercase tracking-wider px-4 py-3 rounded-lg bg-paper-ink text-paper hover:bg-bronze-text transition-colors"
          >
            Sign &amp; fund job →
          </button>
          <p className="mt-3 font-data text-[10px] text-paper-ink-faint">
            {isConnected
              ? "Executed via Backstop's demo wallet · your wallet signs the My Agents record"
              : "Passkey signature · no seed phrase · attempts BSC Testnet first"}
          </p>
        </>
      )}

      {started && !result && (
        <p className="font-data text-[11px] text-paper-ink-faint">Awaiting signature…</p>
      )}

      {started && result?.mode === "live" && (
        <div>
          <p className="font-data text-[11px] uppercase tracking-wider text-bronze-text mb-3">
            {result.ok ? "Confirmed on BSC Testnet" : "Live attempt failed"}
          </p>
          {result.ok ? (
            <div className="space-y-2">
              <p className="font-data text-[13px] text-paper-ink tabnum">
                Job #{result.jobId} · {result.status} · {budget} U
              </p>
              {result.explorerUrl && (
                <a
                  href={result.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block font-data text-[11px] text-bronze-text underline underline-offset-2"
                >
                  View transaction on BscScan Testnet →
                </a>
              )}
              <TrackingStatus status={trackStatus} error={trackError} />
            </div>
          ) : (
            <p className="text-[13px] text-stamp leading-relaxed">{result.error}</p>
          )}
        </div>
      )}

      {started && result?.mode === "simulated" && (
        <div>
          <ol className="space-y-3 mb-4">
            {SIM_STAGES.map((s, i) => {
              const reached = simStep > i;
              const active = simStep === i + 1 && stage !== "done";
              return (
                <li key={s.key} className="flex items-center gap-3 text-[13px]">
                  <span
                    className={`font-data text-xs w-4 ${
                      reached ? "text-verdigris" : "text-paper-ink-faint"
                    }`}
                  >
                    {reached ? "✓" : active ? "…" : "○"}
                  </span>
                  <span className={reached ? "text-paper-ink" : "text-paper-ink-faint"}>{s.label}</span>
                </li>
              );
            })}
          </ol>
          {stage === "done" && (
            <div className="border-t border-paper-line pt-4">
              <p className="font-data text-[13px] text-paper-ink tabnum mb-2">
                Funded · {budget} U
              </p>
              <p className="font-data text-[11px] text-paper-ink-faint break-all mb-3">
                {agent.manifestHash}
              </p>
              <p className="font-data text-[11px] text-paper-ink-faint border-t border-paper-line pt-3">
                Simulated — {result.error}
              </p>
            </div>
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
      return (
        <p className="font-data text-[11px] text-verdigris">
          Added to My Agents →
        </p>
      );
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
