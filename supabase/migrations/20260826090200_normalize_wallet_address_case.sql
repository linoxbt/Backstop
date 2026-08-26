-- getHiresForWallet (src/lib/chain/hires.ts) queried with
-- `.ilike("wallet_address", walletAddress)`, but the only index on this
-- column is the functional index below on `lower(wallet_address)` --
-- Postgres does not rewrite a plain `x ILIKE $1` predicate to use a
-- `lower(x)` functional index, so every My Agents page load was a
-- sequential scan once this table has real rows.
--
-- The actual fix is application-side (store and query wallet_address
-- lowercased everywhere -- Ethereum addresses are case-insensitive by
-- identity; checksum casing is a typo-guard, not part of the address), so
-- a plain equality index is enough. This migration normalizes any existing
-- rows and swaps the functional index for a plain one that a plain `=`
-- predicate can actually use.
update hires set wallet_address = lower(wallet_address) where wallet_address <> lower(wallet_address);

drop index hires_wallet_address_idx;
create index hires_wallet_address_idx on hires (wallet_address);
