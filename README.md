# Backstop

An agent marketplace for BNB Chain's **Smart Money Era** hackathon — rebalancing, grid
trading, yield and health-factor agents, each hired against a verified **assurance band**
and backed by a shared on-chain assurance pool that pays out automatically when an agent
misses what it promised.

## Design direction

Two art directions from the pitch phase, combined:

- **The Vault** governs structure — stone/steel/bronze palette, the "chambers around a
  reserve" logic for how the four categories relate to the assurance pool.
- **The Ledger** governs proof — inside each agent's page, the assurance band reads as a
  document (ruled lines, tabular numerals), and the one moment that gets fast, decisive
  motion is a rebate: a red ink stamp, not a slow mechanism. Red (`--color-stamp`) is
  reserved for exactly that one meaning across the whole product.

Fonts, as actually shipped (`src/app/layout.tsx`, `src/app/globals.css`): **Space
Grotesk** (display), **Outfit** (body/UI chrome), **DM Mono** (data/ledger numerals),
plus **Forum** — a serif reserved for the landing page's dark "Momento" hero sections
only (`MomentoHero.tsx`, `GuaranteeReveal.tsx`), never used elsewhere. Tokens live in
`src/app/globals.css`.

## Structure

```
src/
  app/
    page.tsx                  landing page — dark hero, wayfinding diagram, 4 categories
    marketplace/page.tsx       full sortable/filterable agent table
    agents/[id]/page.tsx       agent dossier — assurance band, hire flow
    pool/page.tsx              assurance pool — reserve stats, session key, rebate ledger
    my-agents/page.tsx         real, wallet-signed hire records + rebate status
    advantage-report/page.tsx  TermiX Agent Advantage Report template
    api/cron/rebalance-check/  authenticated endpoint the auto-rebate cron job hits
  components/                  AssuranceBand, HireFlow, WayfindingDiagram, etc.
  lib/
    types.ts                   Agent / AssuranceBand / CategoryMeta types
    agents.ts                  13-agent data set (5 real, 8 illustrative)
    pool.ts                    illustrative assurance pool stats + rebate log
    budget.ts                  exact decimal budget parsing (no float precision loss)
    rateLimit.ts               in-memory + Postgres-backed rate limiting
    supabase.ts                publishable (read) + service-role (write) Supabase clients
    chain/hireAgent.ts         real ERC-8183 hire server action (@bnbagent/sdk)
    chain/hires.ts             wallet-signed hire records + rebate linkage (Supabase)
    chain/hireAuthMessage.ts   the message a hirer's wallet signs to authorize a record
    chain/bandBreach.ts        the real payout trigger — which real agents missed their band
    chain/rebalanceBreach.ts   an honest, separate PancakeSwap-liquidity signal (informational)
    chain/autoRebate.ts        pays a real, per-hire rebate for every breached agent's hires
    chain/rebates.ts           reads the real rebate ledger for /pool
agents/                        5 independent BNB Agent Studio seller-agent projects
.github/workflows/             the 30-minute scheduled auto-rebate cron trigger
.env.example                   env vars for the live chain wiring above
```

## Live chain wiring

The hire flow is wired against the real `@bnbagent/sdk` (npm, published by the
`bnb-chain` org) and the ERC-8183 contracts it already has deployed on BSC Testnet —
there's nothing to deploy on our side. `src/lib/chain/hireAgent.ts` is a server action
that runs the actual `createJob → registerJob → fund → getJob` sequence from the SDK's
own `typescript/README.md`.

It's gated, not faked: `HireFlow` always calls the real server action first. Without a
funded wallet and a real provider address it returns `{ mode: "simulated", error }` and
the UI falls back to the illustrative stepper that was already here, with that reason
printed at the bottom — so it's never ambiguous which one you're looking at. Given
credentials and a real agent, it returns `{ mode: "live", jobId, status, explorerUrl }`
from an actual BSC Testnet transaction.

**To turn it on**, copy `.env.example` to `.env.local` and set:

- `PRIVATE_KEY` + `WALLET_PASSWORD` — the hirer's wallet. Fund it with testnet BNB (gas)
  and the ERC-8183 payment token ("United Stables") via the BSC Testnet Faucet linked
  from the hackathon's technical resources.
- `DEMO_PROVIDER_ADDRESS` — any `0x` address, to smoke-test that `createJob`/`fund`
  actually lands on-chain before you have a real agent deployed. The job just won't get
  fulfilled unless something is really listening for it.
- Once you've deployed a real agent (`npm install -g @bnbagent/studio-cli`, then
  `bag skills install`), set that agent's real address on its `providerAddress` field in
  `src/lib/agents.ts` instead of relying on the demo fallback.

Since this README was first written, three more pieces went real:

- **Wallet-signed hire records** (`src/lib/chain/hires.ts`, `/my-agents`) — hiring while
  a wallet is connected signs a real authorization message, verified server-side
  (`viem.verifyMessage`, with a 5-minute staleness check against replay) before being
  stored in Supabase. Writes go through a service-role client, not the public
  publishable key — the `hires`/`rebates` tables have no public insert policy, so a
  forged row can't be inserted directly against the Supabase REST API either.
- **A real, automatic rebate trigger** (`src/lib/chain/autoRebate.ts`,
  `src/lib/chain/bandBreach.ts`) — a GitHub Actions job hits an authenticated cron
  endpoint every 30 minutes, which checks every real agent's actual assurance-band
  status and pays a real rebate, from the Altana pool session, to the wallet of every
  real hire against a breached agent that hasn't been rebated yet. Idempotency is a
  database `unique` constraint (`rebates.hire_id`), not a timer, so it's safe across
  cold starts. `/pool`'s ledger shows these real payouts labeled "● Real payout",
  distinct from the older illustrative `REBATE_LOG` entries.
- **A Postgres-backed rate limiter** (`src/lib/rateLimit.ts`) — the hire flow's per-IP
  cooldown now coordinates across serverless instances via a Supabase RPC function,
  keyed on Netlify's non-spoofable `x-nf-client-connection-ip` header, falling back to
  the original in-memory limiter when Supabase isn't configured.

Not yet wired, same honesty policy applies (build real, or say clearly what's mocked):

- **Agent data** (`src/lib/agents.ts`) — realistic BSC protocol names and plausible band
  numbers for the 8 illustrative agents, not live 8004scan reads. The `AssuranceBand`
  itself is still static/illustrative data even for the 5 real agents — nothing in the
  app observes an agent's actual execution yet, which is also the one remaining honesty
  gap in the auto-rebate trigger above: it pays out based on this same static
  `band.status`, not a live performance measurement.
- **Agent Advantage Report** (`/advantage-report`) — intentionally left as a template with
  bracketed placeholders, not invented numbers. TermiX grades whether the numbers are
  provably real; fill it in from actual measured runs (with attached outputs) before
  submitting, not the night before.
- **Wallet connect** — the header button is real (Reown AppKit), but it authorizes the
  My Agents record only, not the on-chain payment. The hirer wallet for the actual
  ERC-8183 job still comes from server-side `PRIVATE_KEY`/`WALLET_PASSWORD`; a real
  end-user flow would use `AltanaWalletProvider` with a passkey session instead.

## Next steps toward submission

1. Deploy at least one real agent per category via `bag` and set its `providerAddress`
   so the four listings aren't all simulated at once.
2. Wire agent listings to live 8004scan Pro API data (complimentary tier for
   participants) so Data Quality is real, not mocked.
3. Replace the static, illustrative `AssuranceBand.status` with a real measurement of
   an agent's actual execution — the one gap that still makes the auto-rebate trigger's
   payout decision honest-but-not-yet-live, per the note above.
4. Switch the hirer side from `PRIVATE_KEY` to `AltanaWalletProvider` + passkey session
   for the actual ERC-8183 transaction (My Agents already gets a real wallet signature
   today — it's just an authorization record, not the payment signer yet).
5. Run the three Agent Advantage Report tasks for real and replace the template.

## Development

```
npm run dev     # start dev server
npm run build   # production build (also runs the TypeScript check)
npm run lint    # eslint
```
