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
```

## What's real vs. mocked right now

This pass is the frontend and interaction design: information architecture, the
assurance-band component, the hire flow's job lifecycle UI, and the pool/session-key
surface. It is **not yet wired to chain**. Specifically mocked:

- **Agent data** (`src/lib/agents.ts`) — realistic BSC protocol names (PancakeSwap v3,
  Venus, Aave V3) and plausible band numbers, not live 8004scan reads. Swap
  `getAgent`/`agentsByCategory` for real ERC-8004 registry + ERC-8183 manifest reads.
- **Hire flow** (`src/components/HireFlow.tsx`) — the OPEN → FUNDED stepper is a timed UI
  simulation. Wire `begin()` to `hireErc8183Agent(...)` and drive stage off real job
  status, including the SUBMITTED/SETTLED states the UI already has room for.
- **Assurance pool session** (`src/lib/pool.ts`, `/pool`) — call allowlist / spend cap /
  expiry are illustrative. Needs a real Altana `grantSession` call and a live Keystore
  Explorer link once the pool vault exists on-chain.
- **Agent Advantage Report** (`/advantage-report`) — intentionally left as a template with
  bracketed placeholders, not invented numbers. TermiX grades whether the numbers are
  provably real; fill it in from actual measured runs (with attached outputs) before
  submitting, not the night before.
- **Wallet connect** — the header button is a styled stub pending passkey/Altana wiring.

## Next steps toward submission

1. Wire agent listings to live 8004scan Pro API data (complimentary tier for
   participants) so Data Quality is real, not mocked.
2. Wire `HireFlow` to the ERC-8183 SDK against BSC Testnet, then Mainnet at judging.
3. Stand up the actual assurance pool contract/vault as an Altana-scoped wallet; replace
   `src/lib/pool.ts` with live reads and register the session in Keystore.
4. Run the three Agent Advantage Report tasks for real and replace the template.

## Development

```
npm run dev     # start dev server
npm run build   # production build (also runs the TypeScript check)
npm run lint    # eslint
```
