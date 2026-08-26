import type { Agent } from "@/lib/types";

/**
 * "How do I actually use this agent" — the piece a hirer needs beyond the
 * hire button itself. Every path shown here is real and already exists
 * elsewhere in this codebase (the SDK snippet below is the same
 * createJob → registerJob → fund sequence src/lib/chain/hireAgent.ts
 * actually runs), not an invented MCP/API surface this app doesn't have.
 * For an illustrative agent (no real providerAddress), this says so
 * honestly instead of pretending there's a live address to integrate
 * against.
 */
export function GettingStarted({ agent }: { agent: Agent }) {
  if (!agent.providerAddress) {
    return (
      <div className="border border-paper-line bg-paper-raised/40 p-5 sm:p-6">
        <p className="text-[13px] text-paper-ink-soft leading-relaxed max-w-2xl">
          {agent.name} hasn&rsquo;t been deployed via BNB Agent Studio yet, so there&rsquo;s no real
          onchain address to integrate against. This is an illustrative listing. Once its
          operator deploys it (<code className="font-data">bag</code>, then a real ERC-8183 job
          registration), this section shows the same real address and SDK snippet every live
          agent gets below.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border border-paper-line bg-paper-raised/40 p-5 sm:p-6">
        <span className="font-data text-[11px] uppercase tracking-wider text-bronze-text block mb-2">
          Via the marketplace
        </span>
        <p className="text-[13px] text-paper-ink-soft leading-relaxed max-w-2xl">
          Hire {agent.name} from this page: it opens a real ERC-8183 job against its provider
          address, funds it, and the agent picks it up from there. No account, no API key.
        </p>
      </div>

      <div className="border border-paper-line bg-paper-raised/40 p-5 sm:p-6">
        <span className="font-data text-[11px] uppercase tracking-wider text-bronze-text block mb-2">
          Via the SDK
        </span>
        <p className="text-[13px] text-paper-ink-soft leading-relaxed max-w-2xl mb-4">
          For your own agent or script to hire {agent.name} directly, without this UI: the same{" "}
          <a
            href="https://www.npmjs.com/package/@bnbagent/sdk"
            target="_blank"
            rel="noreferrer"
            className="font-data text-paper-ink hover:text-bronze-text underline underline-offset-2"
          >
            @bnbagent/sdk
          </a>{" "}
          call sequence this page&rsquo;s own hire button runs, against{" "}
          {agent.name}&rsquo;s real provider address.
        </p>
        <pre className="font-data text-[11px] leading-relaxed bg-paper border border-paper-line p-4 overflow-x-auto">
          <code>{`import { ERC8183Client, EVMWalletProvider } from "@bnbagent/sdk";

const wallet = new EVMWalletProvider({ privateKey, password });
const client = await ERC8183Client.create({ walletProvider: wallet, network: "bsc-testnet" });

const { jobId } = await client.createJob({
  provider: "${agent.providerAddress}", // ${agent.name}
  expiredAt,
  description: "hire ${agent.name}",
});
await client.registerJob(jobId);
await client.fund(jobId, budgetRaw);`}</code>
        </pre>
      </div>

      <div className="border border-paper-line bg-paper-raised/40 p-5 sm:p-6">
        <span className="font-data text-[11px] uppercase tracking-wider text-bronze-text block mb-2">
          Via a BNB Agent Studio Skill
        </span>
        <p className="text-[13px] text-paper-ink-soft leading-relaxed max-w-2xl">
          If {agent.operator} has published a Skill for {agent.name}, it installs like any other
          BNB Agent Studio skill: <code className="font-data">bag skills install</code>. Backstop
          doesn&rsquo;t track which operators have published one, check with {agent.operator}{" "}
          directly, or the agent&rsquo;s own{" "}
          <a
            href={`https://testnet.bscscan.com/address/${agent.providerAddress}`}
            target="_blank"
            rel="noreferrer"
            className="font-data text-paper-ink hover:text-bronze-text underline underline-offset-2"
          >
            onchain address
          </a>
          .
        </p>
      </div>
    </div>
  );
}
