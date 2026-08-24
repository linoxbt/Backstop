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
  unit: string; // display unit for its assurance band, e.g. "%", "HF"
}

export type JobStage = "OPEN" | "FUNDED" | "SUBMITTED" | "SETTLED";

export interface AssuranceBand {
  unit: string;
  scaleMin: number;
  scaleMax: number;
  historicalLow: number;
  historicalHigh: number;
  promisedLow: number;
  promisedHigh: number;
  realized: number;
  cycleLabel: string;
  status: "within" | "breach";
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
