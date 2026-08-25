"use client";

import { useState } from "react";
import type { AssuranceBand as AssuranceBandT } from "@/lib/types";
import { bandPct } from "@/lib/band";
import { Track, Legend } from "./AssuranceBand";

type Tone = "ink" | "paper";

const TONE = {
  ink: {
    panel: "border-stone-line bg-stone-raised/60",
    divider: "border-stone-line",
    label: "font-ui font-medium text-sm text-ink",
    faint: "text-ink-faint",
    body: "text-ink-soft",
    button: "bg-ink text-stone hover:bg-bronze-text",
    stamp: "text-stamp border-stamp",
    strong: "text-ink",
    ok: "text-verdigris",
  },
  paper: {
    panel: "border-steel-line bg-steel-raised",
    divider: "border-steel-line",
    label: "font-ui font-medium text-sm text-paper-on-steel",
    faint: "text-paper-on-steel/45",
    body: "text-paper-on-steel/70",
    button: "bg-bronze-text text-paper-on-steel hover:bg-bronze-bright hover:text-steel",
    stamp: "text-stamp-soft border-stamp-soft",
    strong: "text-paper-on-steel",
    ok: "text-verdigris-soft",
  },
} as const;

export function AssuranceBandInteractive({
  band,
  agentName,
  tone = "ink",
}: {
  band: AssuranceBandT;
  agentName: string;
  tone?: Tone;
}) {
  const t = TONE[tone];
  const [triggered, setTriggered] = useState(false);
  const restLeft = (bandPct(band, band.promisedLow) + bandPct(band, band.promisedHigh)) / 2;
  const pending = band.status === "pending" || band.realized === null;
  const realizedLeft = pending ? null : bandPct(band, band.realized as number);
  const markerLeft = pending ? null : triggered ? realizedLeft : restLeft;

  if (pending) {
    return (
      <div className={`border p-5 sm:p-7 ${t.panel}`}>
        <div className="flex items-baseline justify-between gap-3 mb-6">
          <span className={t.label}>{agentName}</span>
          <span className={`font-data text-xs tabnum ${t.faint}`}>{band.cycleLabel}</span>
        </div>
        <Track band={band} markerLeft={null} tone={tone} />
        <div className="mt-3">
          <Legend band={band} tone={tone} />
        </div>
        <p className={`mt-6 pt-6 border-t text-[13px] leading-relaxed max-w-md ${t.divider} ${t.body}`}>
          No cycle has settled yet — the promised band above is what this agent is underwritten
          against from its first hire. Once a cycle closes, its realized outcome lands here
          against the same manifest.
        </p>
      </div>
    );
  }

  return (
    <div className={`border p-5 sm:p-7 ${t.panel}`}>
      <div className="flex items-baseline justify-between gap-3 mb-6">
        <span className={t.label}>{agentName}</span>
        <span className={`font-data text-xs tabnum ${t.faint}`}>{band.cycleLabel}</span>
      </div>

      <Track band={band} markerLeft={markerLeft} tone={tone} />

      <div className="mt-3">
        <Legend band={band} tone={tone} />
      </div>

      <button
        onClick={() => setTriggered((v) => !v)}
        className={`mt-6 inline-flex items-center gap-2 font-data text-xs uppercase tracking-wider px-4 py-2.5 transition-colors ${t.button}`}
      >
        {triggered ? "Reset ↺" : `Settle ${band.cycleLabel.toLowerCase()} →`}
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-out ${
          triggered ? `grid-rows-[1fr] mt-6 pt-6 border-t ${t.divider}` : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          {band.status === "breach" && band.rebate ? (
            <div className="flex items-center gap-5">
              <div
                className={`shrink-0 font-data font-bold text-lg border-[3px] px-3 py-2 text-center leading-tight ${t.stamp} ${
                  triggered ? "animate-stamp-hit" : "opacity-0"
                }`}
                style={triggered ? { animationDelay: "0.85s" } : undefined}
              >
                REBATE
                <br />
                ISSUED
              </div>
              <p className={`text-[13px] leading-relaxed max-w-md ${t.body}`}>
                {band.rebate.note} The pool paid{" "}
                <span className={`font-data font-bold ${t.strong}`}>{band.rebate.amount}</span>{" "}
                under {band.rebate.clause}.
              </p>
            </div>
          ) : (
            <p
              className={`text-[13px] leading-relaxed max-w-md ${t.ok} ${
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
