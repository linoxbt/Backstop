create table hires (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  agent_id text not null,
  budget_human text not null,
  job_id text,
  tx_hash text,
  mode text not null check (mode in ('live', 'simulated')),
  auth_message text not null,
  auth_signature text not null,
  created_at timestamptz not null default now()
);

create index hires_wallet_address_idx on hires (lower(wallet_address));

alter table hires enable row level security;

-- Anyone can read hires (needed for the client-side My Agents page to
-- look up records by connected wallet). Inserts happen only through the
-- app's own Server Action, which verifies auth_signature against
-- wallet_address + auth_message with viem's verifyMessage before ever
-- calling insert -- this table has no fund custody, so a permissive
-- insert policy is an acceptable tradeoff for a hackathon demo rather
-- than standing up a privileged service-role path.
create policy "public read" on hires for select using (true);
create policy "public insert" on hires for insert with check (true);
