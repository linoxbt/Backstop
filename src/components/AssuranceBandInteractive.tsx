"use client";

import { useState } from "react";
import type { AssuranceBand as AssuranceBandT } from "@/lib/types";
import { bandPct } from "@/lib/band";
import { Track, Legend } from "./AssuranceBand";

export function AssuranceBandInteractive({
  band,
  agentName,
}: {
  band: AssuranceBandT;
  agentName: string;
}) {
  const [triggered, setTriggered] = useState(false);
  const restLeft = (bandPct(band, band.promisedLow) + bandPct(band, band.promisedHigh)) / 2;
  const pending = band.status === "pending" || band.realized === null;
  const realizedLeft = pending ? null : bandPct(band, band.realized as number);
  const markerLeft = pending ? null : triggered ? realizedLeft : restLeft;

  if (pending) {
    return (
      <div className="border border-paper-line bg-paper-raised/60 p-5 sm:p-7">
        <div className="flex items-baseline justify-between gap-3 mb-6">
          <span className="font-ui font-medium text-sm">{agentName}</span>
          <span className="font-data text-xs text-paper-ink-faint tabnum">{band.cycleLabel}</span>
        </div>
        <Track band={band} markerLeft={null} />
        <div className="mt-3">
          <Legend band={band} />
        </div>
        <p className="mt-6 pt-6 border-t border-paper-line text-[13px] text-paper-ink-soft leading-relaxed max-w-md">
          No cycle has settled yet — the promised band above is what this agent is underwritten
          against from its first hire. Once a cycle closes, its realized outcome lands here
          against the same manifest.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-paper-line bg-paper-raised/60 p-5 sm:p-7">
      <div className="flex items-baseline justify-between gap-3 mb-6">
        <span className="font-ui font-medium text-sm">{agentName}</span>
        <span className="font-data text-xs text-paper-ink-faint tabnum">{band.cycleLabel}</span>
      </div>

      <Track band={band} markerLeft={markerLeft} />

      <div className="mt-3">
        <Legend band={band} />
      </div>

      <button
        onClick={() => setTriggered((v) => !v)}
        className="mt-6 inline-flex items-center gap-2 font-data text-xs uppercase tracking-wider px-4 py-2.5 bg-paper-ink text-paper hover:bg-bronze-text transition-colors"
      >
        {triggered ? "Reset ↺" : `Settle ${band.cycleLabel.toLowerCase()} →`}
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-out ${
          triggered ? "grid-rows-[1fr] mt-6 pt-6 border-t border-paper-line" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          {band.status === "breach" && band.rebate ? (
            <div className="flex items-center gap-5">
              <div
                className={`shrink-0 font-data font-bold text-lg text-stamp border-[3px] border-stamp px-3 py-2 text-center leading-tight ${
                  triggered ? "animate-stamp-hit" : "opacity-0"
                }`}
                style={triggered ? { animationDelay: "0.85s" } : undefined}
              >
                REBATE
                <br />
                ISSUED
              </div>
              <p className="text-[13px] text-paper-ink-soft leading-relaxed max-w-md">
                {band.rebate.note} The pool paid{" "}
                <span className="font-data text-paper-ink font-bold">{band.rebate.amount}</span> under{" "}
                {band.rebate.clause}.
              </p>
            </div>
          ) : (
            <p
              className={`text-[13px] text-verdigris leading-relaxed max-w-md ${
                triggered ? "animate-fade-rise" : "opacity-0"
              }`}
              style={triggered ? { animationDelay: "0.85s" } : undefined}
            >
              Realized {band.realized}
              {band.symbol} {band.unit} landed inside the promised band. No rebate necessary —
              the manifest closes clean.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
