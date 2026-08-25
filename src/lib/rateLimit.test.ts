import { describe, expect, it } from "vitest";
import { checkRateLimit } from "./rateLimit";

describe("checkRateLimit", () => {
  it("allows the first call for a fresh key", () => {
    const result = checkRateLimit(`test-${Math.random()}`, 10);
    expect(result.allowed).toBe(true);
  });

  it("rejects an immediate second call for the same key", () => {
    const key = `test-${Math.random()}`;
    checkRateLimit(key, 10);
    const second = checkRateLimit(key, 10);
    expect(second.allowed).toBe(false);
    expect(second.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("treats different keys independently", () => {
    const a = `test-a-${Math.random()}`;
    const b = `test-b-${Math.random()}`;
    checkRateLimit(a, 10);
    const resultB = checkRateLimit(b, 10);
    expect(resultB.allowed).toBe(true);
  });

  it("allows a call again once the window has elapsed", async () => {
    const key = `test-${Math.random()}`;
    checkRateLimit(key, 0.05); // 50ms window
    await new Promise((resolve) => setTimeout(resolve, 80));
    const result = checkRateLimit(key, 0.05);
    expect(result.allowed).toBe(true);
  });
});
