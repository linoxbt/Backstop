import { describe, expect, it } from "vitest";
import { parseBudgetToRaw } from "./budget";

describe("parseBudgetToRaw", () => {
  it("parses a whole-number budget with thousands separators exactly", () => {
    const result = parseBudgetToRaw("2,500", 18);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.raw).toBe(BigInt("2500000000000000000000"));
  });

  it("parses a decimal budget exactly (no float precision loss)", () => {
    // Math.round(2500.33 * 10**18) produces 2500329999999999934464 —
    // proven wrong when this bug was found. parseUnits must be exact.
    const result = parseBudgetToRaw("2500.33", 18);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.raw).toBe(BigInt("2500330000000000000000"));
  });

  it("parses a large budget exactly", () => {
    const result = parseBudgetToRaw("999999999", 18);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.raw).toBe(BigInt("999999999000000000000000000"));
  });

  it("rejects non-numeric input", () => {
    const result = parseBudgetToRaw("abc", 18);
    expect(result.ok).toBe(false);
  });

  it("rejects zero", () => {
    const result = parseBudgetToRaw("0", 18);
    expect(result.ok).toBe(false);
  });

  it("rejects negative numbers", () => {
    const result = parseBudgetToRaw("-5", 18);
    expect(result.ok).toBe(false);
  });

  it("rejects empty input", () => {
    const result = parseBudgetToRaw("", 18);
    expect(result.ok).toBe(false);
  });

  it("rounds (does not reject) more decimal places than the token supports", () => {
    // parseUnits rounds the excess digit rather than throwing — a much
    // better failure mode than the float bug this replaced (deterministic,
    // bounded to the last digit, instead of losing precision throughout).
    const result = parseBudgetToRaw("1.1234567", 6);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.raw).toBe(BigInt("1123457"));
  });

  it("tolerates surrounding whitespace", () => {
    const result = parseBudgetToRaw("  2500  ", 18);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.raw).toBe(BigInt("2500000000000000000000"));
  });
});
