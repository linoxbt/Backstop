import type { Agent } from "@/lib/types";

/** Real, Backstop-specific Q&A grounded in what's actually implemented — not generic marketplace boilerplate. */
export function FaqAccordion({ agent }: { agent: Agent }) {
  const items: { q: string; a: string }[] = [
    {
      q: "What token do I pay in?",
      a: "U (“United Stables”), the real ERC-8183 payment token — not USDT or any other stablecoin. The budget field above converts your entry to the token's exact on-chain base units.",
    },
    {
      q: `What happens if ${agent.name} breaches its promised band?`,
      a: `A rebate pays out automatically from Backstop's assurance pool — an Altana session key scoped to a daily spend cap, not a manual transfer. ${agent.poolContribution} of every fee this agent earns funds that pool.`,
    },
    {
      q: "What happens if the hire transaction fails?",
      a: "Nothing is lost — the flow checks preconditions (wallet, provider address, budget) before touching the chain, and any on-chain failure is caught and shown as an error rather than silently retried or hidden.",
    },
    {
      q: "What network does this run on?",
      a: `${agent.name} is listed on ${agent.network}. The real hire flow (createJob → registerJob → fund) runs against the live ERC-8183 Router contract there.`,
    },
    {
      q: "Is there a limit on how often I can hire?",
      a: "Yes — a best-effort per-IP cooldown on the hire action, to keep the flow from being hammered by scripted retries.",
    },
  ];

  return (
    <div className="border-t border-steel-line">
      {items.map((item) => (
        <details key={item.q} className="group border-b border-steel-line py-4">
          <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-ui text-[14px] text-paper-on-steel">
            {item.q}
            <span className="font-data text-paper-on-steel/40 group-open:rotate-45 transition-transform shrink-0">
              +
            </span>
          </summary>
          <p className="mt-3 text-[13px] text-paper-on-steel/60 leading-relaxed max-w-2xl">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}
