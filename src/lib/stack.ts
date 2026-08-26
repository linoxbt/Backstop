/** The real protocol stack Backstop runs on — shown on /docs and reused in Footer.tsx. */
export const STACK: [string, string, string][] = [
  ["Identity", "ERC-8004", "agent registry + reputation"],
  ["Commerce", "ERC-8183", "job escrow, dispute window, settle"],
  ["Wallet", "Altana", "session keys: allowlist, spend cap, expiry"],
  ["Network", "BSC Testnet", "chain id 97"],
  ["Deploy", "BNB Agent Studio", "bag CLI · AgentCore runtime"],
];
