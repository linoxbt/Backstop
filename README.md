# Backstop

**The BNB agent marketplace with a reserve behind it.**

Backstop is a submission for BNB Chain's **Smart Money Era** hackathon (Main Track:
*Build the BNB Agent Studio Marketplace*). It's a marketplace for hiring autonomous
rebalancing, grid trading, yield, and health-factor agents on BSC. Every hire is
measured against a verified **assurance band**, and backed by a shared onchain
assurance pool that pays a rebate automatically when an agent misses what it promised.

**Live:** [get-backstop.netlify.app](https://get-backstop.netlify.app)
**Repo:** [github.com/linoxbt/Backstop](https://github.com/linoxbt/Backstop)

---

## Table of contents

1. [The problem, and how Backstop answers it](#the-problem-and-how-backstop-answers-it)
2. [The four categories](#the-four-categories)
3. [How an agent actually gets into this app](#how-an-agent-actually-gets-into-this-app)
4. [The guarantee: how a hire is backed](#the-guarantee-how-a-hire-is-backed)
5. [What's real, what's illustrative, an honest inventory](#whats-real-whats-illustrative-an-honest-inventory)
6. [Architecture](#architecture)
7. [Getting started](#getting-started)
8. [Environment variables](#environment-variables)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [Project structure](#project-structure)
12. [Hackathon tracks this targets](#hackathon-tracks-this-targets)
13. [Roadmap](#roadmap)

For a much deeper technical walkthrough (every file, every data flow, verified against
the actual source), see [`DOCUMENTATION.md`](./DOCUMENTATION.md).

---

## The problem, and how Backstop answers it

Autonomous agents that manage money (rebalancing a PancakeSwap position, watching a
Venus health factor, routing idle stablecoins to yield) are only as trustworthy as the
claims their operators make about them. There's no standard way to know, before hiring
one, whether it actually does what it says, and no recourse if it doesn't.

Backstop answers this two ways:

- **Discovery.** Anyone can find out what agents actually exist on BNB Chain, not a
  hand-picked list, but the real, live ERC-8004 identity registry (see
  [§3](#how-an-agent-actually-gets-into-this-app)).
- **A guarantee, not just a listing.** For the agents Backstop actually underwrites, a
  hire is measured against a promised performance band, and a shared assurance pool,
  funded by a cut of every agent's fees, pays a capped rebate automatically the moment
  a real breach is detected. No dispute process, no claim form.

## The four categories

| Category | What it does |
|---|---|
| **Rebalancing** | Resets LP ranges before price drifts out of the fee-earning band |
| **Grid Trading** | Places and re-places grid orders sized to realized volatility |
| **Yield Optimisation** | Routes idle capital to the highest verified APR, net of gas |
| **Health Factor Monitoring** | De-levers a lending position before it gets close to liquidation |

The Main Track's own judging criteria call for treating all four as equally deep, not
one as primary. Backstop's real (onchain) agents span all four, not one category with
the rest as filler.

## How an agent actually gets into this app

This is worth being precise about, because it's easy to assume the wrong model. **There
is no "list your agent with Backstop" step.** Backstop surfaces agents two different
ways, and they answer two different questions:

1. **Backstop's own curated roster** (`src/lib/agents.ts`): agents Backstop has an
   actual relationship with: a real fee model, a promised assurance band, a real hire
   flow, and (for the ones with a real onchain `providerAddress`) a real ERC-8183 job on
   BSC Testnet when you hire them. Getting into this roster today is a manual, 3-step
   process described in full on [`/docs`](https://get-backstop.netlify.app/docs#listing):
   deploy via BNB Agent Studio, register an ERC-8004 identity, send Backstop the real
   address. There's no self-serve form yet.
2. **Every agent registered on the real ERC-8004 identity registry** (the marketplace's
   "Beyond the roster" section, `src/lib/erc8004.ts`'s `listRegisteredAgents()`).
   Registration on ERC-8004 is permissionless and has nothing to do with Backstop at
   all. Any operator who registers becomes discoverable here automatically, with real
   name, description, owner, verification status, and onchain reputation, sourced live
   from [8004scan](https://8004scan.io)'s public API. As of this writing there are
   **1,896+ real agents** registered on BSC Testnet alone. Backstop makes no promise
   about these agents (no assurance band, no fee relationship, no hire flow) because it
   genuinely has no data of its own about them beyond what the registry publishes.

The first is "agents Backstop personally underwrites." The second is "every agent that
actually exists on the chain, whether or not Backstop has ever heard of it," which is
the more literal reading of "build a marketplace where it's easy to find agents on BNB
Chain."

## The guarantee: how a hire is backed

Three steps, enforced onchain:

1. **Hire funds a real ERC-8183 job.** `createJob → registerJob → setBudget → fund` runs
   against the live ERC-8183 Router contract on BSC Testnet via the real `@bnbagent/sdk`.
   The promised band commits at this point, not after the fact.
2. **The cycle settles.** `ERC8183Client.settle(jobId)` is permissionless: once a job
   clears its dispute window, any wallet can call it to pull the policy's verdict and
   apply it onchain. Backstop's own UI offers this immediately after a live hire, and
   again from any past hire in [My Agents](https://get-backstop.netlify.app/my-agents).
3. **Miss the band, and the pool pays a capped rebate, automatically.** Every 30
   minutes, an unattended job (`.github/workflows/rebalance-breach-check.yml`) checks
   every real agent's actual assurance-band status and pays a real rebate, from the
   assurance pool's Altana session, to the wallet of every real hire against a breached
   agent that hasn't been rebated yet. Idempotency is a database `unique` constraint
   claimed *before* any transfer happens, not a timer. Safe even if two cron
   invocations somehow overlap.

## What's real, what's illustrative, an honest inventory

Every feature below is one of these, and the app itself always says which:

| Feature | Status |
|---|---|
| ERC-8183 hire flow (`createJob`→`fund`) | **Real.** Needs `PRIVATE_KEY`/`WALLET_PASSWORD` configured, else falls back to a labeled simulated stepper |
| ERC-8183 job settlement | **Real.** `ERC8183Client.settle()`, same wallet requirement |
| Wallet-signed hire records ("My Agents") | **Real.** `viem.verifyMessage`, replay-protected, stored in Postgres |
| Automatic rebate payout | **Real.** Needs `ALTANA_SESSION` provisioned, else the pool session shows "Illustrative" |
| ERC-8004 identity lookup (per agent) | **Real.** Public 8004scan API, no key required |
| ERC-8004 agent discovery ("Beyond the roster") | **Real.** Live registry query on both BSC Testnet and BSC Mainnet, searchable, paginated up to 100 rows, each with a real hire action and a full detail page |
| Hiring a discovered (non-catalog) agent | **Real.** Same real ERC-8183 flow, funded straight to the agent's real address, on whichever chain it's actually registered on. No assurance band or pool coverage: Backstop has no relationship with these agents |
| PancakeSwap v3 pool liveness + telemetry | **Real.** Live onchain reads, snapshotted every 30 min |
| Pool reserve balance, payout ratio, rebates paid | **Real when a session/data exists, explicitly labeled "illustrative" otherwise** |
| Cross-instance rate limiting | **Real.** Postgres-backed, falls back to in-memory when unconfigured |
| Leaderboard, by hires | **Real.** Ranked by actual `hires` rows, not a hand-authored count |
| `AssuranceBand.realized`/`status` per agent | **Illustrative.** Hand-authored, not a live measurement of agent execution (the one honesty gap that also affects the auto-rebate trigger's payout *decision*, even though the payout *mechanism* is real) |
| Agent Advantage Report | **Template.** Bracketed placeholders, not invented numbers. See [`scripts/run-advantage-task.ts`](#testing) |

Check `GET /api/health` on any deployment for a one-request, boolean-only status of
every piece of live wiring that can silently degrade. It reveals presence only, never
secret values.

## Architecture

- **Framework:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4
- **Chain:** BSC Testnet (chain id 97), via `viem` and the real `@bnbagent/sdk`
  (ERC-8183 job escrow, `@bnbagent/sdk/wallets` for the Altana session)
- **Identity:** ERC-8004, read via [8004scan](https://8004scan.io)'s public API
- **Database:** Supabase (Postgres): `hires`, `rebates`, `rate_limits`, `pool_snapshots`
  tables, RLS-enforced (public read, service-role-only write)
- **Wallet connect:** Reown AppKit / wagmi
- **Hosting:** Netlify (`@netlify/plugin-nextjs`)
- **Automation:** GitHub Actions, a 30-minute cron hitting an authenticated endpoint
  that checks band breaches, pays real rebates, and records real pool telemetry

See [`DOCUMENTATION.md`](./DOCUMENTATION.md) for a complete, file-by-file breakdown.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

The app runs with zero configuration. Every live feature above gracefully degrades to
an honestly-labeled illustrative/simulated state without any env vars set. To turn
pieces on, copy `.env.example` to `.env.local` and see [Environment variables](#environment-variables).

```bash
npm run build    # production build (also runs the TypeScript check)
npm run lint     # eslint
npm run test     # vitest
```

## Environment variables

Full, commented reference lives in [`.env.example`](./.env.example). Summary:

| Variable | Unlocks |
|---|---|
| `PRIVATE_KEY`, `WALLET_PASSWORD` | The real ERC-8183 hire and settle flow |
| `DEMO_PROVIDER_ADDRESS` | A wiring smoke test for agents with no real `providerAddress` yet |
| `NEXT_PUBLIC_REOWN_PROJECT_ID` | Wallet connect (free at [dashboard.reown.com](https://dashboard.reown.com)) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Reading real hire/rebate/pool-telemetry data |
| `SUPABASE_SERVICE_ROLE_KEY` | *Writing* real hire/rebate/pool-telemetry data, and cross-instance rate limiting |
| `ALTANA_ADMIN_PRIVATE_KEY`, `ALTANA_SESSION` | The real automatic rebate payout (see `scripts/provision-altana-pool.ts`) |
| `CRON_SECRET` | The authenticated auto-rebate/pool-telemetry cron endpoint |
| `EIGHT004SCAN_API_KEY` | Optional. The free 8004scan Pro-tier rate-limit upgrade; the app works fully without it |

## Testing

```bash
npm run test
```

Vitest covers the pure logic layer directly: budget parsing, band math, rate limiting,
band-breach/liquidity-breach evaluation, pool-drift derivation, hire-message freshness,
and the auto-rebate claim/pay/finalize orchestration (including its double-payout-race
protection, mocked end-to-end).

For the TermiX Advantage Report specifically, `scripts/run-advantage-task.ts` runs one
real, timed hire against a real agent and prints a ready-to-paste row:

```bash
npx tsx scripts/run-advantage-task.ts meridian-rebalancer 2500
```

## Deployment

Deployed on Netlify from this repo's `main` branch. `netlify.toml` configures
`@netlify/plugin-nextjs`; no additional build steps are required. Supabase migrations
under [`supabase/migrations/`](./supabase/migrations) are applied in filename order and
must be run against any new Supabase project before wiring its keys in (they include a
real RLS-hardening fix partway through the history; applying them out of order or
skipping ahead leaves a real forgery gap open).

## Project structure

```
src/
  app/
    page.tsx                    landing page, real pool stats, real category showcase
    marketplace/page.tsx        curated roster + real, searchable ERC-8004 registry discovery
    agents/[id]/page.tsx        agent dossier: identity, pool telemetry, hire + settle
    discovered/[chainId]/[contract]/[tokenId]/page.tsx   full ERC-8004 record for a discovered agent
    pool/page.tsx               assurance pool: real reserve, session, rebate ledger
    my-agents/page.tsx          real, wallet-signed hire records + rebate status
    pool/rebates/[id]/page.tsx  full detail page for any real or illustrative ledger entry
    advantage-report/page.tsx   TermiX Agent Advantage Report template
    docs/page.tsx                reference docs, including "how an agent gets listed"
    api/health/                 boolean-only config status for every live-wiring piece
    api/cron/rebalance-check/   authenticated endpoint the auto-rebate cron job hits
  components/                   HireFlow, SettleJobButton, AgentStats, DiscoveredAgents, etc.
  lib/
    types.ts                    Agent / AssuranceBand / CategoryMeta types
    agents.ts                   5-agent curated data set, every one with a real onchain address
    pool.ts                     illustrative fallback pool figures
    erc8004.ts                  real ERC-8004 identity lookup, registry discovery + agent detail
    chain/discoveredAgents.ts   client-callable search/pagination over the live registry
    pancakeswap.ts               real PancakeSwap v3 pool state reads, cached
    budget.ts                   exact decimal budget parsing (no float precision loss)
    rateLimit.ts                in-memory + Postgres-backed rate limiting
    supabase.ts                 publishable (read) + service-role (write) Supabase clients
    chain/hireAgent.ts          real ERC-8183 hire and settle server actions
    chain/hires.ts              wallet-signed hire records, real per-agent hire stats
    chain/bandBreach.ts         the real payout trigger: which real agents missed their band
    chain/rebalanceBreach.ts    an honest, separate PancakeSwap-liquidity signal
    chain/autoRebate.ts         claim-before-pay rebate payout, race-safe
    chain/rebates.ts            real rebate ledger reads for /pool
    chain/poolSnapshots.ts      real PancakeSwap pool telemetry, snapshotted every 30 min
    wallet/altanaPool.ts        the assurance pool's real Altana session and balance
scripts/
  run-advantage-task.ts         one real, timed hire, for the TermiX report
  provision-altana-pool.ts      one-time: grant and register the pool's Altana session
agents/                         5 independent BNB Agent Studio seller-agent projects
supabase/migrations/            hires/rebates/rate_limits/pool_snapshots schema, applied in order
.github/workflows/               the 30-minute scheduled auto-rebate + telemetry cron trigger
```

## Hackathon tracks this targets

- **Main Track**: the marketplace itself. Discovery (curated + live ERC-8004 registry),
  understanding (real per-agent stats, identity, pool telemetry), activation (real hire
  and settle flow) across all four categories equally.
- **Best Built with Altana**: the assurance pool's payout session is a real Altana
  session key (`transfer` only, spend-capped, expiring), separate from the admin key
  that granted it.
- **TermiX Challenge**: see the [Agent Advantage Report](https://get-backstop.netlify.app/advantage-report)
  and `scripts/run-advantage-task.ts`.
- **PancakeSwap Challenge**: real, live PancakeSwap v3 pool liveness/telemetry checks
  feed both the auto-rebate trigger's informational liquidity signal and the pool-drift
  data shown on real agents' dossier pages.

## Roadmap

1. Fund a real hirer wallet in production so the live hire/settle flow is reachable by
   judges, not just by the code.
2. Provision `ALTANA_SESSION` for real (or explicitly skip that track this cycle).
3. Register at least one of Backstop's own curated agents on ERC-8004 for real.
4. Replace the static, illustrative `AssuranceBand.status` with a real measurement of
   an agent's actual execution: the one remaining honesty gap, including in the
   auto-rebate trigger's payout *decision* (the payout *mechanism* is already real).
5. Run the three Agent Advantage Report tasks for real and replace the template.
6. Switch the hirer side from a server-held `PRIVATE_KEY` to the connected wallet itself
   as the transaction signer. My Agents already gets a real wallet signature today; it's
   an authorization record, not the payment signer yet.
