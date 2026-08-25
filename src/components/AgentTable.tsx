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
  const [status, setStatus] = useState<StatusFilter>("all");
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
  }, [agents, category, status, sortKey, sortDir]);

  const selectedAgents = agents.filter((a) => selected.includes(a.id));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
          All categories
        </FilterChip>
        {CATEGORIES.map((c) => (
          <FilterChip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
            {c.label}
          </FilterChip>
        ))}
        <span className="w-px self-stretch bg-stone-line mx-1 hidden sm:block" />
        <FilterChip active={status === "all"} onClick={() => setStatus("all")}>
          Any status
        </FilterChip>
        <FilterChip active={status === "breach"} onClick={() => setStatus("breach")}>
          Rebate paid
        </FilterChip>
        <FilterChip active={status === "pending"} onClick={() => setStatus("pending")}>
          Pending
        </FilterChip>
      </div>

      <p className="font-data text-[11px] text-ink-faint mb-3 tabnum">
        {rows.length} agent{rows.length === 1 ? "" : "s"}
      </p>

      <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
        <table className="w-full border-collapse text-sm min-w-[640px]">
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

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-data text-[11px] uppercase tracking-wider px-3 py-1.5 border transition-colors ${
        active
          ? "border-ink bg-ink text-stone"
          : "border-stone-line text-ink-soft hover:border-bronze-text hover:text-bronze-text"
      }`}
    >
      {children}
    </button>
  );
}
