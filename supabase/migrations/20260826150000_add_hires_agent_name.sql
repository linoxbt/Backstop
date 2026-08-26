-- A name snapshot for a hire against an agent outside Backstop's own
-- curated catalog (src/lib/agents.ts) -- an ERC-8004-discovered agent,
-- hired directly via DiscoveredAgentHire.tsx. The catalog has no entry to
-- resolve a display name from for these later, so it's captured once at
-- hire time. Left null for a catalog-agent hire, where getAgent(agent_id)
-- already resolves a live name -- see src/lib/chain/hires.ts.
alter table hires add column if not exists agent_name text;
