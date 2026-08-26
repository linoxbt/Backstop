import "server-only";

/**
 * Read-only client for 8004scan's public agent index
 * (https://www.8004scan.io/api/v1) — the same endpoint `bag doctor` checks
 * registration against. Works with no API key at all (the anonymous tier —
 * 30 req/min, 1,000/day, confirmed against 8004scan's own developer docs),
 * which is what this app has always run on. `EIGHT004SCAN_API_KEY` is
 * optional: when set, it's sent as `X-API-Key` to use the free Pro-tier
 * upgrade the hackathon offers participants (3,000 req/min, 3,000,000/day —
 * obtained via https://forms.gle/jQevEPCAacBXaKG79, not by changing any
 * code). Never throws — a network or API failure returns `null` so callers
 * can fall back to an honest "unknown" state rather than crashing or
 * fabricating a result.
 */

const SCAN_API_URL = "https://www.8004scan.io/api/v1";
const BSC_TESTNET_CHAIN_ID = 97;

export interface Erc8004Registration {
  agentId: string;
  tokenId: string;
  name: string;
  isVerified: boolean;
  totalScore: number;
  totalFeedbacks: number;
  createdAt: string;
}

/**
 * Look up whether `ownerAddress` has a registered ERC-8004 agent on BSC
 * Testnet. Returns `null` if unregistered or the lookup failed — the two
 * cases are deliberately not distinguished here (both mean "nothing to
 * show"); a thrown fetch/network error also collapses to `null`.
 */
export async function lookupAgentByOwner(
  ownerAddress: string,
): Promise<Erc8004Registration | null> {
  try {
    const params = new URLSearchParams({
      chain_id: String(BSC_TESTNET_CHAIN_ID),
      owner_address: ownerAddress,
      limit: "1",
    });
    const apiKey = process.env.EIGHT004SCAN_API_KEY;
    const res = await fetch(`${SCAN_API_URL}/agents?${params.toString()}`, {
      headers: apiKey ? { "X-API-Key": apiKey } : undefined,
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      items: {
        agent_id: string;
        token_id: string;
        name: string;
        is_verified: boolean;
        total_score: number;
        total_feedbacks: number;
        created_at: string;
      }[];
    };
    const item = data.items?.[0];
    if (!item) return null;
    return {
      agentId: item.agent_id,
      tokenId: item.token_id,
      name: item.name,
      isVerified: item.is_verified,
      totalScore: item.total_score,
      totalFeedbacks: item.total_feedbacks,
      createdAt: item.created_at,
    };
  } catch {
    return null;
  }
}
