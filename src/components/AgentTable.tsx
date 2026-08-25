"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Agent, AgentCategory } from "@/lib/types";
import { CATEGORIES } from "@/lib/agents";
import { Track } from "./AssuranceBand";
import { bandPct } from "@/lib/band";

type SortKey = "name" | "category" | "hirers" | "cycles";
type CategoryFilter = "all" | AgentCategory;
type StatusFilter = "all" | "breach" | "within" | "pending";
type NetworkFilter = "all" | Agent["network"];
const MAX_COMPARE = 4;

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
}: {
  agents: Agent[];
  initialCategory?: CategoryFilter;
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
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("hirers");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<string[]>([]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" || key === "category" ? "asc" : "desc");
    }
  }

  function toggleCompare(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }

  const rows = useMemo(() => {
    let list = agents.filter((a) => category === "all" || a.category === category);
    if (status !== "all") list = list.filter((a) => a.band.status === status);
    if (network !== "all") list = list.filter((a) => a.network === network);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) => a.name.toLowerCase().includes(q) || a.operator.toLowerCase().includes(q),
      );
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

  const selectedAgents = agents.filter((a) => selected.includes(a.id));
  const networks = useMemo(
    () => Array.from(new Set(agents.map((a) => a.network))).sort(),
    [agents],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by agent or operator…"
          className="flex-1 min-w-[180px] font-data text-[13px] bg-stone border border-stone-line px-3 py-2 placeholder:text-ink-faint focus-visible:outline-2 focus-visible:outline-bronze"
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

      <p className="font-data text-[11px] text-ink-faint mb-3 tabnum">
        {rows.length} agent{rows.length === 1 ? "" : "s"}
      </p>

      <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
        <table className="w-full border-collapse text-sm sm:min-w-[720px]">
          <thead>
            <tr className="border-b border-stone-line">
              <th className="w-8" />
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
                  <td className="py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(agent.id)}
                      onChange={() => toggleCompare(agent.id)}
                      aria-label={`Compare ${agent.name}`}
                      className="w-4 h-4 accent-bronze-text cursor-pointer"
                    />
                  </td>
                  <td className="hidden sm:table-cell font-data text-[11px] text-ink-faint tabnum">
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td className="py-3 pr-4">
                    <Link href={`/agents/${agent.id}`} className="block hover:text-bronze-text transition-colors">
                      <span className="font-display text-base">{agent.name}</span>
                      <span className="block font-data text-[10px] uppercase tracking-wider text-ink-faint mt-0.5">
                        {agent.operator}
                      </span>
                    </Link>
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

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          selectedAgents.length >= 2 ? "grid-rows-[1fr] mt-8" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border border-bronze-text bg-stone-raised/50 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <span className="font-data text-[11px] uppercase tracking-wider text-bronze-text">
                Comparing {selectedAgents.length}
              </span>
              <button
                onClick={() => setSelected([])}
                className="font-data text-[11px] uppercase tracking-wider text-ink-faint hover:text-ink transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="space-y-5">
              {selectedAgents.map((agent) => {
                const markerLeft =
                  agent.band.realized === null ? null : bandPct(agent.band, agent.band.realized);
                return (
                  <div key={agent.id}>
                    <div className="flex items-baseline justify-between gap-3 mb-1.5">
                      <span className="font-ui text-sm font-medium">{agent.name}</span>
                      <span className="font-data text-xs tabnum text-ink-faint">
                        {agent.band.realized === null
                          ? "no cycle yet"
                          : `${agent.band.realized}${agent.band.symbol} realized`}
                      </span>
                    </div>
                    <Track band={agent.band} markerLeft={markerLeft} size="compact" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
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
