export type AgentCategory =
  | "rebalancing"
  | "grid-trading"
  | "yield"
  | "health-factor";

export interface CategoryMeta {
  id: AgentCategory;
  label: string;
  clause: string; // ledger clause reference, e.g. "Form A"
  verb: string; // what the agent does, present tense
  blurb: string; // category-specific framing for what its band proves
}

export type JobStage = "OPEN" | "FUNDED" | "SUBMITTED" | "SETTLED";

export interface AssuranceBand {
  /** symbol appended directly to each number, e.g. "%" or "" */
  symbol: string;
  /** descriptor shown after the range, e.g. "cycle return", "HF maintained" */
  unit: string;
  scaleMin: number;
  scaleMax: number;
  historicalLow: number;
  historicalHigh: number;
  promisedLow: number;
  promisedHigh: number;
  /** null when no cycle has settled yet — nothing to plot */
  realized: number | null;
  cycleLabel: string;
  status: "within" | "breach" | "pending";
  rebate?: {
    amount: string;
    clause: string;
    note: string;
  };
}

export interface Agent {
  id: string;
  name: string;
  category: AgentCategory;
  tagline: string;
  description: string;
  operator: string;
  agentId8004: string;
  network: "BSC Mainnet" | "BSC Testnet";
  protocols: string[];
  feeModel: string;
  poolContribution: string;
  cyclesCompleted: number;
  hirers: number;
  manifestHash: string;
  band: AssuranceBand;
  jobStage: JobStage;
}
