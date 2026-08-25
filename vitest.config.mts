import { defineConfig } from "vitest/config";
import path from "node:path";

const rootDir = import.meta.dirname;

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
      // server-only throws unconditionally outside a Next.js client/server
      // bundler boundary — mirrors the exact same stub-alias technique
      // next.config.ts already uses for @base-org/account, for the same
      // reason: this is a real runtime guard we want in production, not
      // something to disable, but tests run in plain Node.
      "server-only": path.resolve(rootDir, "./src/lib/empty-module.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
