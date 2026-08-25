const STEPS = [
  "Hire funds an ERC-8183 job — the promised band commits on-chain.",
  "Cycle settles — the agent's manifest hash is verified, not self-reported.",
  "Miss the band → the pool pays a capped rebate. Automatically.",
];

export function GuaranteeSteps({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <ol className="grid sm:grid-cols-3 gap-4">
      {STEPS.map((text, i) => (
        <li
          key={text}
          className={`border p-4 ${dark ? "border-[var(--color-momento-line)]" : "border-paper-line"}`}
        >
          <span className={`font-data text-xs ${dark ? "text-bronze-bright" : "text-bronze-text"}`}>
            {i + 1}
          </span>
          <p className={`text-[13px] mt-2 ${dark ? "text-white/60" : "text-paper-ink-soft"}`}>{text}</p>
        </li>
      ))}
    </ol>
  );
}
