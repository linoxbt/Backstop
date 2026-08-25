-- One real rebate payout, tied to exactly one real hire. The `unique`
-- constraint on hire_id is the idempotency guard for the automated rebate
-- checker: a given hire can never be rebated twice, which is what actually
-- prevents a double-pay across cold starts -- not an in-memory cooldown.
create table rebates (
  id uuid primary key default gen_random_uuid(),
  hire_id uuid not null references hires(id) unique,
  agent_id text not null,
  amount_raw text not null,
  tx_hash text,
  reason text not null,
  paid_at timestamptz not null default now()
);

create index rebates_agent_id_idx on rebates (agent_id);

alter table rebates enable row level security;

-- Reads are public (My Agents and /pool need to show real payouts to any
-- visitor). There is deliberately no insert policy: only the service-role
-- client (src/lib/supabase.ts's supabaseAdmin, which bypasses RLS by
-- construction) can write a row, from the server-only auto-rebate path.
create policy "public read" on rebates for select using (true);

-- Convenience view for the auto-rebate checker: every live hire for a given
-- agent that doesn't yet have a matching rebates row. A plain left-join
-- anti-join, not a stored procedure -- the real safety net against a double
-- payout is the unique constraint above, not this view.
create view unrebated_hires as
select h.id, h.agent_id, h.wallet_address, h.mode, h.created_at
from hires h
left join rebates r on r.hire_id = h.id
where r.id is null;
