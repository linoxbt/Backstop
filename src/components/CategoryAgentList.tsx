"use client";

import { useState } from "react";
import type { Agent } from "@/lib/types";
import { AgentRow } from "./AgentRow";
import { Track } from "./AssuranceBand";
import { bandPct } from "@/lib/band";

const MAX_COMPARE = 3;

export function CategoryAgentList({ agents, index }: { agents: Agent[]; index: number }) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }

  const selectedAgents = agents.filter((a) => selected.includes(a.id));

  return (
    <div>
      {agents.map((agent, i) => (
        <AgentRow
          key={agent.id}
          agent={agent}
          folio={`§${index}${i + 1}`}
          selected={selected.includes(agent.id)}
          onToggleCompare={toggle}
        />
      ))}

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          selectedAgents.length >= 2 ? "grid-rows-[1fr] mt-6" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border border-bronze-text bg-stone-raised/50 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <span className="font-data text-[11px] uppercase tracking-wider text-bronze-text">
                Comparing {selectedAgents.length} agents
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
