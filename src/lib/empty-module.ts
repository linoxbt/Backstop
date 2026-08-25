// Stub for optional peer packages (x402 payment schemes pulled in transitively
// by @wagmi/connectors' Base Account / Coinbase CDP SDK integration) that we
// don't use and aren't published in a way Turbopack can statically resolve.
// Aliased in next.config.ts so the build doesn't fail on their dynamic import().
export {};
