"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Agent, AgentCategory } from "@/lib/types";
import { CATEGORIES } from "@/lib/agents";

type SortKey = "name" | "category" | "hirers" | "cycles";
type CategoryFilter = "all" | AgentCategory;
type StatusFilter = "all" | "breach" | "within" | "pending";
type NetworkFilter = "all" | Agent["network"];

const STATUS_META: Record<Agent["band"]["status"], { label: string; className: string }> = {
  within: { label: "On track", className: "text-verdigris" },
  breach: { label: "Rebate paid", className: "text-stamp" },
  pending: { label: "Pending", className: "text-ink-faint" },
};

function SortHeader({
  label,
  active,
  dir,
  onClick,
  className = "",
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
  className?: string;
}) {
  return (
    <th className={`text-left align-middle font-normal ${className}`}>
      <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-1 font-data text-[11px] uppercase tracking-wider whitespace-nowrap transition-colors ${
          active ? "text-ink" : "text-ink-faint hover:text-ink-soft"
        }`}
      >
        {label}
        {active && <span>{dir === "asc" ? "↑" : "↓"}</span>}
      </button>
    </th>
  );
}

export function AgentTable({
  agents,
  initialCategory = "all",
  initialQuery = "",
}: {
  agents: Agent[];
  initialCategory?: CategoryFilter;
  initialQuery?: string;
}) {
  const [category, setCategory] = useState<CategoryFilter>(initialCategory);
  // useState's initializer only runs on mount, so if this component stays
  // mounted across a client-side navigation that changes initialCategory
  // (e.g. a future same-page category link), the filter would silently go
  // stale without resyncing. Adjusting state during render (React's
  // documented pattern for this) rather than in an effect avoids the extra
  // commit-then-rerender pass a useEffect-based resync would cause.
  const [prevInitialCategory, setPrevInitialCategory] = useState(initialCategory);
  if (initialCategory !== prevInitialCategory) {
    setPrevInitialCategory(initialCategory);
    setCategory(initialCategory);
  }
  const [status, setStatus] = useState<StatusFilter>("all");
  const [network, setNetwork] = useState<NetworkFilter>("all");
  const [query, setQuery] = useState(initialQuery);
  const [prevInitialQuery, setPrevInitialQuery] = useState(initialQuery);
  if (initialQuery !== prevInitialQuery) {
    setPrevInitialQuery(initialQuery);
    setQuery(initialQuery);
  }
  const [sortKey, setSortKey] = useState<SortKey>("hirers");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const previewAgent = agents.find((a) => a.id === previewId) ?? null;

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" || key === "category" ? "asc" : "desc");
    }
  }

  const rows = useMemo(() => {
    let list = agents.filter((a) => category === "all" || a.category === category);
    if (status !== "all") list = list.filter((a) => a.band.status === status);
    if (network !== "all") list = list.filter((a) => a.network === network);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((a) => {
        const categoryMeta = CATEGORIES.find((c) => c.id === a.category);
        const haystack = [
          a.name,
          a.operator,
          a.tagline,
          a.description,
          categoryMeta?.label,
          categoryMeta?.verb,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    const dir = sortDir === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => {
      switch (sortKey) {
        case "name":
          return a.name.localeCompare(b.name) * dir;
        case "category":
          return a.category.localeCompare(b.category) * dir;
        case "cycles":
          return (a.cyclesCompleted - b.cyclesCompleted) * dir;
        case "hirers":
        default:
          return (a.hirers - b.hirers) * dir;
      }
    });
    return list;
  }, [agents, category, status, network, query, sortKey, sortDir]);

  const networks = useMemo(
    () => Array.from(new Set(agents.map((a) => a.network))).sort(),
    [agents],
  );

  return (
    <div>
      <div className="mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by agent or operator…"
          className="block w-full font-data text-[13px] bg-stone border border-stone-line px-3 py-2 mb-3 placeholder:text-ink-faint focus-visible:outline-2 focus-visible:outline-bronze"
        />
        <div className="flex flex-wrap items-center gap-3">
        <FilterSelect
          label="Sort"
          value={`${sortKey}-${sortDir}`}
          onChange={(v) => {
            const [key, dir] = v.split("-") as [SortKey, "asc" | "desc"];
            setSortKey(key);
            setSortDir(dir);
          }}
          options={[
            { value: "hirers-desc", label: "Most hirers" },
            { value: "cycles-desc", label: "Most cycles" },
            { value: "name-asc", label: "Name A–Z" },
            { value: "category-asc", label: "Category" },
          ]}
        />
        <FilterSelect
          label="Category"
          value={category}
          onChange={(v) => setCategory(v as CategoryFilter)}
          options={[
            { value: "all", label: "All categories" },
            ...CATEGORIES.map((c) => ({ value: c.id, label: c.label })),
          ]}
        />
        <FilterSelect
          label="Network"
          value={network}
          onChange={(v) => setNetwork(v as NetworkFilter)}
          options={[
            { value: "all", label: "All networks" },
            ...networks.map((n) => ({ value: n, label: n })),
          ]}
        />
        <FilterSelect
          label="Status"
          value={status}
          onChange={(v) => setStatus(v as StatusFilter)}
          options={[
            { value: "all", label: "Any status" },
            { value: "breach", label: "Rebate paid" },
            { value: "within", label: "On track" },
            { value: "pending", label: "Pending" },
          ]}
        />
        </div>
      </div>

      <p className="font-data text-[11px] text-ink-faint mb-3 tabnum">
        {rows.length} agent{rows.length === 1 ? "" : "s"}
      </p>

      <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
        <table className="w-full border-collapse text-sm sm:min-w-[640px]">
          <thead>
            <tr className="border-b border-stone-line">
              <th className="hidden sm:table-cell w-10" />
              <SortHeader
                label="Agent"
                active={sortKey === "name"}
                dir={sortDir}
                onClick={() => toggleSort("name")}
                className="py-2 pr-4"
              />
              <SortHeader
                label="Category"
                active={sortKey === "category"}
                dir={sortDir}
                onClick={() => toggleSort("category")}
                className="hidden sm:table-cell py-2 pr-4"
              />
              <th className="hidden lg:table-cell py-2 pr-4 font-data text-[11px] uppercase tracking-wider text-ink-faint text-left">
                Network
              </th>
              <th className="hidden md:table-cell py-2 pr-4 font-data text-[11px] uppercase tracking-wider text-ink-faint text-left">
                Band
              </th>
              <th className="py-2 pr-4 font-data text-[11px] uppercase tracking-wider text-ink-faint text-left">
                Status
              </th>
              <SortHeader
                label="Hirers"
                active={sortKey === "hirers"}
                dir={sortDir}
                onClick={() => toggleSort("hirers")}
                className="py-2 pr-4 text-right"
              />
              <SortHeader
                label="Cycles"
                active={sortKey === "cycles"}
                dir={sortDir}
                onClick={() => toggleSort("cycles")}
                className="hidden sm:table-cell py-2 text-right"
              />
            </tr>
          </thead>
          <tbody>
            {rows.map((agent, i) => {
              const meta = STATUS_META[agent.band.status];
              return (
                <tr key={agent.id} className="border-b border-stone-line hover:bg-stone-raised/40">
                  <td className="hidden sm:table-cell py-3 font-data text-[11px] text-ink-faint tabnum">
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-baseline gap-2">
                      <Link
                        href={`/agents/${agent.id}`}
                        className="hover:text-bronze-text transition-colors"
                      >
                        <span className="font-display text-base">{agent.name}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setPreviewId(agent.id)}
                        className="font-data text-[10px] uppercase tracking-wider text-ink-faint hover:text-bronze-text transition-colors shrink-0"
                      >
                        Preview
                      </button>
                    </div>
                    <span className="block font-data text-[10px] uppercase tracking-wider text-ink-faint mt-0.5">
                      {agent.operator}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell py-3 pr-4 font-data text-[11px] text-ink-soft whitespace-nowrap">
                    {CATEGORIES.find((c) => c.id === agent.category)?.label}
                  </td>
                  <td className="hidden lg:table-cell py-3 pr-4 font-data text-[11px] text-ink-soft whitespace-nowrap">
                    {agent.network}
                  </td>
                  <td className="hidden md:table-cell py-3 pr-4 font-data text-[12px] text-ink-soft whitespace-nowrap tabnum">
                    {agent.band.promisedLow}
                    {agent.band.symbol}–{agent.band.promisedHigh}
                    {agent.band.symbol}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`font-data text-[11px] uppercase tracking-wider ${meta.className}`}>
                      {meta.label}
                    </span>
                    {agent.band.realized !== null && (
                      <span className="block font-data text-[11px] text-ink-faint tabnum">
                        {agent.band.realized}
                        {agent.band.symbol} realized
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4 font-data text-[12px] text-ink tabnum text-right">
                    {agent.hirers}
                  </td>
                  <td className="hidden sm:table-cell py-3 font-data text-[12px] text-ink-faint tabnum text-right">
                    {agent.cyclesCompleted}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {previewAgent && <AgentPreview agent={previewAgent} onClose={() => setPreviewId(null)} />}
    </div>
  );
}

/**
 * Quick intelligence panel: Promise vs. Proof, using only real fields on
 * `agent` — no fabricated "success rate." Proof is the current cycle's
 * actual status plus real lifetime counts, not an invented rolling metric
 * this app has no per-job history to compute honestly.
 */
function AgentPreview({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const category = CATEGORIES.find((c) => c.id === agent.category);
  const meta = STATUS_META[agent.band.status];
  const { band } = agent;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close preview"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40"
      />
      <div className="relative h-full w-full max-w-md bg-stone border-l border-stone-line overflow-y-auto p-6 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="block font-data text-[11px] uppercase tracking-wider text-ink-faint hover:text-ink transition-colors mb-6"
        >
          ← Close
        </button>

        <span className="block font-data text-[10px] uppercase tracking-wider text-bronze-text">
          {category?.label}
        </span>
        <h2 className="font-display text-2xl mt-1 mb-2">{agent.name}</h2>
        <p className="font-body text-[13px] text-ink-soft leading-relaxed mb-6">{agent.tagline}</p>

        <div className="border-t border-stone-line pt-4 mb-4">
          <span className="font-data text-[10px] uppercase tracking-wider text-ink-faint block mb-1">
            The promise
          </span>
          <p className="font-body text-sm">
            Keep {band.unit} between{" "}
            <span className="font-data tabnum">
              {band.promisedLow}
              {band.symbol}–{band.promisedHigh}
              {band.symbol}
            </span>
          </p>
        </div>

        <div className="border-t border-stone-line pt-4 mb-4">
          <span className="font-data text-[10px] uppercase tracking-wider text-ink-faint block mb-1">
            The proof
          </span>
          <p className={`font-data text-sm uppercase tracking-wider ${meta.className} mb-1`}>
            {meta.label} — {band.cycleLabel}
          </p>
          {band.realized !== null ? (
            <p className="font-body text-sm text-ink-soft">
              Realized {band.realized}
              {band.symbol} {band.unit}
            </p>
          ) : (
            <p className="font-body text-sm text-ink-soft">No cycle has settled yet.</p>
          )}
          <p className="font-data text-[11px] text-ink-faint mt-2 tabnum">
            {agent.cyclesCompleted} cycles completed · {agent.hirers} hirers
          </p>
        </div>

        <div className="border-t border-stone-line pt-4 mb-8">
          <span className="font-data text-[10px] uppercase tracking-wider text-ink-faint block mb-1">
            Backstop
          </span>
          <p className="font-body text-sm text-ink-soft">
            Covered by the assurance pool — {agent.poolContribution} of every fee this agent earns
            funds it.
          </p>
        </div>

        <Link
          href={`/agents/${agent.id}`}
          className="block text-center font-data text-xs uppercase tracking-wider px-4 py-3 bg-ink text-stone hover:bg-bronze-text transition-colors"
        >
          Understand agent →
        </Link>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex items-center gap-2 font-data text-[11px] uppercase tracking-wider text-ink-faint">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-stone border border-stone-line px-2.5 py-2 focus-visible:outline-2 focus-visible:outline-bronze"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
