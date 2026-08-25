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
          <p className="text-[12px] text-ink-faint mb-5 font-data">
            Altana session, scoped to {agent.name} · {agent.poolContribution} to the pool
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
              <p className="font-data text-[13px] text-ink tabnum">
                Job #{result.jobId} · {result.status} · {budget} USDT
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
              <p className="font-data text-[13px] text-ink tabnum mb-2">
                Funded · {budget} USDT
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
