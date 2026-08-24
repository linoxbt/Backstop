"use client";

import { useState } from "react";
import type { Agent } from "@/lib/types";

type Stage = "idle" | "signing" | "open" | "funded";

const STAGES: { key: Stage; label: string }[] = [
  { key: "open", label: "Job opened — terms committed" },
  { key: "funded", label: "Funded — manifest hash locked on-chain" },
];

export function HireFlow({ agent }: { agent: Agent }) {
  const [stage, setStage] = useState<Stage>("idle");
  const [budget, setBudget] = useState("2,500");

  const started = stage !== "idle";

  function begin() {
    setStage("signing");
    window.setTimeout(() => setStage("open"), 500);
    window.setTimeout(() => setStage("funded"), 1300);
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
            Passkey signature · no seed phrase
          </p>
        </>
      )}

      {started && (
        <div>
          <ol className="space-y-3 mb-5">
            {STAGES.map((s) => {
              const reached =
                (s.key === "open" && (stage === "open" || stage === "funded")) ||
                (s.key === "funded" && stage === "funded");
              const active = stage === "signing" && s.key === "open";
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

          {stage === "funded" ? (
            <div className="border-t border-stone-line pt-4">
              <p className="text-[13px] text-ink-soft leading-relaxed mb-2">
                Job funded for <span className="font-data tabnum">{budget} USDT</span>. Manifest
                hash committed — {agent.name} will write its next cycle&rsquo;s realized outcome
                against the band shown above.
              </p>
              <p className="font-data text-[11px] text-ink-faint break-all">
                {agent.manifestHash}
              </p>
            </div>
          ) : (
            <p className="font-data text-[11px] text-ink-faint">Awaiting signature…</p>
          )}
        </div>
      )}
    </div>
  );
}
