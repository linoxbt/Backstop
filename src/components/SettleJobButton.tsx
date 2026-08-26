"use client";

import { useState, useTransition } from "react";
import { settleJobOnChain, type SettleResult } from "@/lib/chain/hireAgent";

/**
 * Real, permissionless on-chain settlement for one specific ERC-8183 job —
 * see settleJobOnChain's own doc comment (src/lib/chain/hireAgent.ts) for
 * why any wallet can call this, not just the original hirer. Shown wherever
 * a real jobId is known (right after a live hire in HireFlow, and per past
 * hire in My Agents) — never a standalone illustrative demo, since a real
 * settle needs a real job id to act on.
 */
export function SettleJobButton({ jobId }: { jobId: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<SettleResult | null>(null);

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const r = await settleJobOnChain(jobId);
            setResult(r);
          })
        }
        className="font-data text-[11px] uppercase tracking-wider px-3 py-2 rounded-lg border border-paper-ink text-paper-ink hover:bg-paper-ink hover:text-paper transition-colors disabled:opacity-50 disabled:cursor-wait"
      >
        {pending ? "Settling job…" : "Settle job →"}
      </button>
      {result && (
        <p
          className={`mt-2 font-data text-[11px] leading-relaxed ${result.ok ? "text-verdigris" : "text-stamp"}`}
        >
          {result.ok ? (
            <>
              Settled. Job status {result.status}.{" "}
              {result.explorerUrl && (
                <a href={result.explorerUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                  View transaction on BscScan →
                </a>
              )}
            </>
          ) : (
            result.error
          )}
        </p>
      )}
    </div>
  );
}
