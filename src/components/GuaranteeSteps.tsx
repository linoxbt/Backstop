const STEPS = [
  "Hire funds an ERC-8183 job — the promised band commits on-chain.",
  "Cycle settles — the agent's manifest hash is verified, not self-reported.",
  "Miss the band → the pool pays a capped rebate. Automatically.",
];

export function GuaranteeSteps() {
  return (
    <ol className="grid sm:grid-cols-3 gap-4">
      {STEPS.map((text, i) => (
        <li key={text} className="border border-stone-line p-4">
          <span className="font-data text-xs text-bronze-text">{i + 1}</span>
          <p className="text-[13px] text-ink-soft mt-2">{text}</p>
        </li>
      ))}
    </ol>
  );
}
