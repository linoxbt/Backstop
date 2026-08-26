"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { DiscoveredAgent, DiscoveredAgentsPage } from "@/lib/erc8004";
import { fetchDiscoveredAgentsPage } from "@/lib/chain/discoveredAgents";
import { DiscoveredAgentHire } from "./DiscoveredAgentHire";

type Tab = "testnet" | "mainnet";
const PAGE_SIZE = 100;

function detailHref(a: DiscoveredAgent): string {
  // agentId is shaped "<chainId>:<contractAddress>:<tokenId>" -- see erc8004.ts.
  const contractAddress = a.agentId.split(":")[1];
  return `/discovered/${a.chainId}/${contractAddress}/${a.tokenId}`;
}

/**
 * Every real agent registered on ERC-8004 -- on both real networks the
 * registry actually spans, BSC Testnet and BSC Mainnet, picked with the tab
 * below -- searchable and paginated up to the registry's real total, up to
 * 100 rows a page. Not Backstop's own curated roster (src/lib/agents.ts, the
 * table above this one): no fee relationship or assurance band for these,
 * but every row can still open a real ERC-8183 hire against the agent's own
 * onchain address, and click through to a full detail page pulling
 * everything the registry itself tracks about it.
 */
export function DiscoveredAgents({
  testnet,
  mainnet,
}: {
  testnet: DiscoveredAgentsPage;
  mainnet: DiscoveredAgentsPage;
}) {
  const [tab, setTab] = useState<Tab>("testnet");
  const [pages, setPages] = useState<Record<Tab, DiscoveredAgentsPage>>({ testnet, mainnet });
  const [offsets, setOffsets] = useState<Record<Tab, number>>({ testnet: 0, mainnet: 0 });
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState<string | undefined>(undefined);
  const [pending, startTransition] = useTransition();

  const page = pages[tab];
  const offset = offsets[tab];
  const chainId = tab === "testnet" ? testnet.agents[0]?.chainId ?? 97 : mainnet.agents[0]?.chainId ?? 56;

  function load(nextTab: Tab, nextOffset: number, search: string | undefined) {
    startTransition(async () => {
      const cid = nextTab === "testnet" ? testnet.agents[0]?.chainId ?? 97 : mainnet.agents[0]?.chainId ?? 56;
      const result = await fetchDiscoveredAgentsPage({ chainId: cid, offset: nextOffset, search });
      setPages((prev) => ({ ...prev, [nextTab]: result }));
      setOffsets((prev) => ({ ...prev, [nextTab]: nextOffset }));
    });
  }

  function switchTab(next: Tab) {
    setTab(next);
    // A tab switch under an active search needs a fresh fetch for that
    // chain -- the initial server-rendered page for the *other* tab was
    // fetched with no search at all.
    if (activeSearch) load(next, 0, activeSearch);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchInput.trim();
    setActiveSearch(q || undefined);
    load(tab, 0, q || undefined);
  }

  function clearSearch() {
    setSearchInput("");
    setActiveSearch(undefined);
    load(tab, 0, undefined);
  }

  const hasNext = offset + page.agents.length < page.total;
  const hasPrev = offset > 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          {(
            [
              ["testnet", "BSC Testnet", testnet.total],
              ["mainnet", "BSC Mainnet", mainnet.total],
            ] as const
          ).map(([key, label, total]) => (
            <button
              key={key}
              type="button"
              onClick={() => switchTab(key)}
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

        <form onSubmit={submitSearch} className="flex items-center gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search any registered agent by name…"
            className="w-56 sm:w-72 font-data text-[13px] bg-paper border border-paper-line px-3 py-2 placeholder:text-paper-ink-faint focus-visible:outline-2 focus-visible:outline-bronze"
          />
          <button
            type="submit"
            className="font-data text-[11px] uppercase tracking-wider px-3 py-2 border border-paper-line hover:border-paper-ink transition-colors"
          >
            Search
          </button>
          {activeSearch && (
            <button
              type="button"
              onClick={clearSearch}
              className="font-data text-[11px] text-paper-ink-faint hover:text-bronze-text transition-colors"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {activeSearch && (
        <p className="font-data text-[11px] text-paper-ink-faint mb-4">
          {page.total.toLocaleString()} result{page.total === 1 ? "" : "s"} for &ldquo;{activeSearch}&rdquo;
          {tab === "testnet" ? " on BSC Testnet" : " on BSC Mainnet"}
        </p>
      )}

      {page.agents.length === 0 ? (
        <p className="text-[13px] text-paper-ink-soft leading-relaxed max-w-md">
          {activeSearch
            ? "No registered agent matched that search on this network."
            : "Couldn’t reach the ERC-8004 registry just now, so there’s nothing to show here this load. This section always reflects the real, live registry, never a cached or invented list."}
        </p>
      ) : (
        <div className={pending ? "opacity-50 transition-opacity" : "transition-opacity"}>
          <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
            <table className="w-full border-collapse text-sm sm:min-w-[720px]">
              <thead>
                <tr className="border-b border-paper-line">
                  <th className="hidden sm:table-cell w-10" />
                  <th className="py-2 pr-4 text-left font-data text-[11px] uppercase tracking-wider text-paper-ink-faint">
                    Agent
                  </th>
                  <th className="hidden md:table-cell py-2 pr-4 text-left font-data text-[11px] uppercase tracking-wider text-paper-ink-faint">
                    Owner
                  </th>
                  <th className="hidden lg:table-cell py-2 pr-4 text-left font-data text-[11px] uppercase tracking-wider text-paper-ink-faint">
                    Protocols
                  </th>
                  <th className="py-2 pr-4 text-right font-data text-[11px] uppercase tracking-wider text-paper-ink-faint">
                    Score
                  </th>
                  <th className="py-2 text-right font-data text-[11px] uppercase tracking-wider text-paper-ink-faint">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {page.agents.map((agent, i) => (
                  <DiscoveredAgentRow key={agent.agentId} agent={agent} index={offset + i} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 mt-6">
        <p className="font-data text-[11px] text-paper-ink-faint tabnum">
          {page.total > 0
            ? `${(offset + 1).toLocaleString()}–${(offset + page.agents.length).toLocaleString()} of ${page.total.toLocaleString()}`
            : null}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!hasPrev || pending}
            onClick={() => load(tab, Math.max(0, offset - PAGE_SIZE), activeSearch)}
            className="font-data text-[11px] uppercase tracking-wider px-3 py-2 border border-paper-line hover:border-paper-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← View previous
          </button>
          <button
            type="button"
            disabled={!hasNext || pending}
            onClick={() => load(tab, offset + PAGE_SIZE, activeSearch)}
            className="font-data text-[11px] uppercase tracking-wider px-3 py-2 border border-paper-line hover:border-paper-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            View next →
          </button>
        </div>
      </div>

      <a
        href={`https://www.8004scan.io/agents?chain=${chainId}`}
        target="_blank"
        rel="noreferrer"
        className="block mt-4 font-data text-xs uppercase tracking-wider text-bronze-text hover:text-bronze-bright transition-colors"
      >
        Browse the full registry on 8004scan →
      </a>
    </div>
  );
}

function DiscoveredAgentRow({ agent, index }: { agent: DiscoveredAgent; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <tr className="border-b border-paper-line hover:bg-paper-raised/40">
        <td className="hidden sm:table-cell py-3 font-data text-[11px] text-paper-ink-faint tabnum">
          {String(index + 1).padStart(3, "0")}
        </td>
        <td className="py-3 pr-4 max-w-xs">
          <div className="flex items-center gap-1.5">
            <Link
              href={detailHref(agent)}
              className="font-display text-base truncate hover:text-bronze-text transition-colors"
            >
              {agent.name}
            </Link>
            {agent.isVerified && (
              <span className="text-verdigris text-[11px] shrink-0" title="Verified on ERC-8004">
                ✓
              </span>
            )}
          </div>
          {agent.description && (
            <p className="text-[11px] text-paper-ink-soft leading-relaxed truncate">{agent.description}</p>
          )}
        </td>
        <td className="hidden md:table-cell py-3 pr-4 font-data text-[11px] text-paper-ink-faint tabnum whitespace-nowrap">
          {agent.ownerLabel ?? `${agent.ownerAddress.slice(0, 6)}…${agent.ownerAddress.slice(-4)}`}
        </td>
        <td className="hidden lg:table-cell py-3 pr-4 font-data text-[10px] uppercase tracking-wider text-paper-ink-faint">
          <div className="flex flex-wrap gap-1">
            {agent.supportedProtocols.map((p) => (
              <span key={p} className="px-1.5 py-0.5 border border-paper-line">
                {p}
              </span>
            ))}
            {agent.x402Supported && <span className="px-1.5 py-0.5 border border-paper-line">x402</span>}
          </div>
        </td>
        <td className="py-3 pr-4 font-data text-[12px] text-paper-ink-soft tabnum text-right whitespace-nowrap">
          {agent.totalScore > 0 ? `★ ${agent.totalScore.toFixed(1)}` : "N/A"}
        </td>
        <td className="py-3 text-right whitespace-nowrap">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="font-data text-[11px] uppercase tracking-wider px-3 py-1.5 border border-paper-line hover:border-bronze-text hover:text-bronze-text transition-colors"
          >
            {expanded ? "Close" : "Hire →"}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-paper-line bg-paper-raised/20">
          <td />
          <td colSpan={4} className="py-4 pr-4">
            <DiscoveredAgentHire agent={agent} />
          </td>
          <td />
        </tr>
      )}
    </>
  );
}
