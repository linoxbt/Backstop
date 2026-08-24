"use client";

import { useState, useTransition } from "react";
import type { Agent } from "@/lib/types";
import { hireAgentOnChain, type HireResult } from "@/lib/chain/hireAgent";

type Stage = "idle" | "pending" | "done";

const SIM_STAGES = [
  { key: "open", label: "Job opened — terms committed" },
  { key: "funded", label: "Funded — manifest hash locked on-chain" },
];

export function HireFlow({ agent }: { agent: Agent }) {
  const [stage, setStage] = useState<Stage>("idle");
  const [budget, setBudget] = useState("2,500");
  const [result, setResult] = useState<HireResult | null>(null);
  const [simStep, setSimStep] = useState<0 | 1 | 2>(0);
  const [, startTransition] = useTransition();

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
    });
  }

  return (
    <div className="border border-stone-line bg-stone-raised/50 p-5 sm:p-7">
      <span className="font-data text-[11px] uppercase tracking-wider text-bronze-text">
        Clause 0 — Activation
      </span>
      <h3 className="font-display text-xl mt-1 mb-4">Hire {agent.name}</h3>

      {!started && (
        <>
          <label className="block font-data text-[11px] uppercase tracking-wider text-ink-faint mb-1.5">
            Position budget (USDT)
          </label>
          <input
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            inputMode="decimal"
            className="w-full font-data text-lg bg-stone border border-stone-line px-3 py-2.5 mb-4 tabnum focus-visible:outline-2 focus-visible:outline-bronze"
          />
          <p className="text-[13px] text-ink-soft mb-5 leading-relaxed">
            Funds a session on your own Altana wallet, scoped to {agent.name} alone — call
            allowlist, spend cap and expiry set before signing. {agent.poolContribution} of the
            agent&rsquo;s fee routes to the assurance pool automatically.
          </p>
          <button
            onClick={begin}
            className="w-full font-data text-xs uppercase tracking-wider px-4 py-3 bg-ink text-stone hover:bg-bronze-text transition-colors"
          >
            Sign &amp; fund job →
          </button>
          <p className="mt-3 font-data text-[10px] text-ink-faint">
            Passkey signature · no seed phrase · attempts BSC Testnet first
          </p>
        </>
      )}

      {started && !result && (
        <p className="font-data text-[11px] text-ink-faint">Awaiting signature…</p>
      )}

      {started && result?.mode === "live" && (
        <div>
          <p className="font-data text-[11px] uppercase tracking-wider text-bronze-text mb-3">
            {result.ok ? "Confirmed on BSC Testnet" : "Live attempt failed"}
          </p>
          {result.ok ? (
            <div className="space-y-2">
              <p className="text-[13px] text-ink-soft leading-relaxed">
                Job <span className="font-data text-ink">#{result.jobId}</span> is{" "}
                <span className="font-data text-ink">{result.status}</span>. Funded for{" "}
                <span className="font-data tabnum">{budget} USDT</span> against the manifest
                shown above.
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
                      reached ? "text-verdigris" : "text-ink-faint"
                    }`}
                  >
                    {reached ? "✓" : active ? "…" : "○"}
                  </span>
                  <span className={reached ? "text-ink" : "text-ink-faint"}>{s.label}</span>
                </li>
              );
            })}
          </ol>
          {stage === "done" && (
            <div className="border-t border-stone-line pt-4">
              <p className="text-[13px] text-ink-soft leading-relaxed mb-2">
                Job funded for <span className="font-data tabnum">{budget} USDT</span>. Manifest
                hash committed — {agent.name} will write its next cycle&rsquo;s realized outcome
                against the band shown above.
              </p>
              <p className="font-data text-[11px] text-ink-faint break-all mb-3">
                {agent.manifestHash}
              </p>
              <p className="font-data text-[11px] text-ink-faint border-t border-stone-line pt-3">
                Simulated — {result.error}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
