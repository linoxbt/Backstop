# Backstop

An agent marketplace for BNB Chain's **Smart Money Era** hackathon — rebalancing, grid
trading, yield and health-factor agents, each hired against a verified **assurance band**
and backed by a shared on-chain assurance pool that pays out automatically when an agent
misses what it promised.

## Design direction

Two art directions from the pitch phase, combined:

- **The Vault** governs structure — stone/steel/bronze palette, `Libre Caslon Display`
  headlines, the "chambers around a reserve" logic for how the four categories relate to
  the assurance pool.
- **The Ledger** governs proof — inside each agent's page, the assurance band reads as a
  document (`STIX Two Text` body, `Courier Prime` data, ruled lines), and the one moment
  that gets fast, decisive motion is a rebate: a red ink stamp, not a slow mechanism. Red
  is reserved for exactly that one meaning across the whole product.

Fonts: `Libre Caslon Display` (display), `STIX Two Text` (body/document), `Public Sans`
(UI chrome), `Courier Prime` (data, ledger numerals). Tokens live in `src/app/globals.css`.

## Structure

```
src/
  app/
    page.tsx                  marketplace home — wayfinding diagram + 4 category listings
    agents/[id]/page.tsx       agent dossier — assurance band, hire flow
    pool/page.tsx              assurance pool — reserve stats, session key, rebate ledger
    advantage-report/page.tsx  TermiX Agent Advantage Report template
  components/                  AssuranceBand, HireFlow, WayfindingDiagram, etc.
  lib/
    types.ts                   Agent / AssuranceBand / CategoryMeta types
    agents.ts                  mock agent data (3 per category, structured for real SDK swap)
    pool.ts                    mock assurance pool + rebate log data
    chain/hireAgent.ts         real ERC-8183 hire server action (@bnbagent/sdk)
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

Not yet wired, same honesty policy applies (build real, or say clearly what's mocked):

- **Agent data** (`src/lib/agents.ts`) — realistic BSC protocol names and plausible band
  numbers, not live 8004scan reads yet. `providerAddress` is unset for all 12 demo
  agents, since none of them are real deployments.
- **Assurance pool session** (`src/lib/pool.ts`, `/pool`) — call allowlist / spend cap /
  expiry are illustrative. `@altananetwork/sdk` is installed (it's a dependency of
  `@bnbagent/sdk`'s Altana wallet provider) but the pool vault itself doesn't exist
  on-chain yet — that's real `grantSession` work, not just a fetch swap.
- **Agent Advantage Report** (`/advantage-report`) — intentionally left as a template with
  bracketed placeholders, not invented numbers. TermiX grades whether the numbers are
  provably real; fill it in from actual measured runs (with attached outputs) before
  submitting, not the night before.
- **Wallet connect** — the header button is a styled stub. The hirer wallet currently
  comes from server-side env vars (fine for a testnet demo); a real end-user flow would
  use `AltanaWalletProvider` with a passkey session instead of `PRIVATE_KEY`.

## Next steps toward submission

1. Deploy at least one real agent per category via `bag` and set its `providerAddress`
   so the four listings aren't all simulated at once.
2. Wire agent listings to live 8004scan Pro API data (complimentary tier for
   participants) so Data Quality is real, not mocked.
3. Switch the hirer side from `PRIVATE_KEY` to `AltanaWalletProvider` + passkey session,
   and stand up the assurance pool itself as an Altana-scoped wallet with a registered
   Keystore session — this is what both unlocks the Altana track and makes `/pool`'s
   session card real instead of illustrative.
4. Run the three Agent Advantage Report tasks for real and replace the template.

## Development

```
npm run dev     # start dev server
npm run build   # production build (also runs the TypeScript check)
npm run lint    # eslint
```
