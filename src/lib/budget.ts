import { parseUnits } from "viem";

export type ParseBudgetResult = { ok: true; raw: bigint } | { ok: false; error: string };

/**
 * Parse a human-entered budget string (e.g. "2,500" or "2500.33") into raw
 * token base units for a token with `decimals` decimal places.
 *
 * Deliberately never does the conversion via `Number(...) * 10 ** decimals`
 * — a JS double can't represent most such products exactly once `decimals`
 * pushes the result past Number.MAX_SAFE_INTEGER (true for any realistic
 * budget at 18 decimals), so that arithmetic silently returns the wrong
 * raw amount. `parseUnits` does exact, string-based decimal math instead.
 */
export function parseBudgetToRaw(budgetHuman: string, decimals: number): ParseBudgetResult {
  const cleanBudget = budgetHuman.replace(/,/g, "").trim();
  const budgetNumber = Number(cleanBudget);
  if (!Number.isFinite(budgetNumber) || budgetNumber <= 0) {
    return { ok: false, error: "Enter a valid budget." };
  }
  try {
    // parseUnits rounds any decimal places beyond `decimals` rather than
    // rejecting them — this only throws on a genuinely malformed number
    // (e.g. "1.2.3", scientific notation, non-numeric characters).
    return { ok: true, raw: parseUnits(cleanBudget, decimals) };
  } catch {
    return { ok: false, error: "Enter a valid budget." };
  }
}
