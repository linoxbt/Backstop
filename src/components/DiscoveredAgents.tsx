"use client";

import { useState } from "react";
import type { DiscoveredAgentsPage } from "@/lib/erc8004";
import { DiscoveredAgentHire } from "./DiscoveredAgentHire";

type Tab = "testnet" | "mainnet";

/**
 * Real agents discovered directly from the ERC-8004 registry via 8004scan,
 * not Backstop's own curated roster (src/lib/agents.ts) — on both real
 * networks the registry actually spans, BSC Testnet and BSC Mainnet, picked
 * with the tab below. No fee relationship or assurance band for these
 * (Backstop has no data of its own about them beyond what the registry
 * publishes), but every card can still open a real ERC-8183 hire against
 * the agent's real onchain owner address — see DiscoveredAgentHire.tsx for
 * why that's honestly a different guarantee than a catalog-agent hire.
 */
export function DiscoveredAgents({
  testnet,
  mainnet,
}: {
  testnet: DiscoveredAgentsPage;
  mainnet: DiscoveredAgentsPage;
}) {
  const [tab, setTab] = useState<Tab>("testnet");
  const page = tab === "testnet" ? testnet : mainnet;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        {(
          [
            ["testnet", "BSC Testnet", testnet.total],
            ["mainnet", "BSC Mainnet", mainnet.total],
          ] as const
        ).map(([key, label, total]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`font-data text-[11px] uppercase tracking-wider px-3.5 py-2 border transition-colors ${
              tab === key
                ? "border-bronze-text bg-bronze-text/10 text-bronze-text"
                : "border-paper-line text-paper-ink-soft hover:border-paper-ink"
            }`}
          >
            {label} {total > 0 && <span className="tabnum">({total.toLocaleString()})</span>}
          </button>
        ))}
      </div>

      {page.agents.length === 0 ? (
        <p className="text-[13px] text-paper-ink-soft leading-relaxed max-w-md">
          Couldn&rsquo;t reach the ERC-8004 registry just now, so there&rsquo;s nothing to show here
          this load. This section always reflects the real, live registry, never a cached or
          invented list.
        </p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {page.agents.map((agent) => (
              <div
                key={agent.agentId}
                className="flex flex-col border border-paper-line bg-paper-raised/40 p-5"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-display text-lg truncate">{agent.name}</span>
                  {agent.isVerified && (
                    <span className="text-verdigris text-[11px] shrink-0" title="Verified on ERC-8004">
                      ✓
                    </span>
                  )}
                </div>
                {agent.description && (
                  <p className="text-[12px] text-paper-ink-soft leading-relaxed mb-3 line-clamp-2">
                    {agent.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-data text-[10px] uppercase tracking-wider text-paper-ink-faint mb-4">
                  <span>{agent.ownerLabel ?? `${agent.ownerAddress.slice(0, 6)}…${agent.ownerAddress.slice(-4)}`}</span>
                  {agent.supportedProtocols.map((p) => (
                    <span key={p} className="px-1.5 py-0.5 border border-paper-line">
                      {p}
                    </span>
                  ))}
                  {agent.x402Supported && <span className="px-1.5 py-0.5 border border-paper-line">x402</span>}
                  {agent.totalScore > 0 && <span className="tabnum">★ {agent.totalScore.toFixed(1)}</span>}
                </div>

                <div className="mt-auto flex items-center justify-between gap-3">
                  <a
                    href={`https://www.8004scan.io/agent/${agent.agentId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-data text-[10px] uppercase tracking-wider text-paper-ink-faint hover:text-bronze-text transition-colors"
                  >
                    View on 8004scan ↗
                  </a>
                  <DiscoveredAgentHire agent={agent} />
                </div>
              </div>
            ))}
          </div>
          <a
            href={`https://www.8004scan.io/agents?chain=${page.agents[0]?.chainId ?? 97}`}
            target="_blank"
            rel="noreferrer"
            className="font-data text-xs uppercase tracking-wider text-bronze-text hover:text-bronze-bright transition-colors"
          >
            Browse all {page.total.toLocaleString()} registered agents on 8004scan →
          </a>
        </>
      )}
    </div>
  );
}
