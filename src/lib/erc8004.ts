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

interface ScanApiAgentItem {
  agent_id: string;
  token_id: string;
  contract_address: string;
  owner_address: string;
  owner_ens: string | null;
  owner_username: string | null;
  name: string;
  description: string | null;
  is_verified: boolean;
  total_score: number;
  total_feedbacks: number;
  star_count: number;
  supported_protocols: string[];
  x402_supported: boolean;
  created_at: string;
}

interface ScanApiListResponse {
  items: ScanApiAgentItem[];
  total: number;
  limit: number;
  offset: number;
}

async function fetchScanApi(path: string, params: Record<string, string>): Promise<Response | null> {
  try {
    const apiKey = process.env.EIGHT004SCAN_API_KEY;
    const url = `${SCAN_API_URL}${path}?${new URLSearchParams(params).toString()}`;
    const res = await fetch(url, {
      headers: apiKey ? { "X-API-Key": apiKey } : undefined,
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 300 },
    });
    return res.ok ? res : null;
  } catch {
    return null;
  }
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
  const res = await fetchScanApi("/agents", {
    chain_id: String(BSC_TESTNET_CHAIN_ID),
    owner_address: ownerAddress,
    limit: "1",
  });
  if (!res) return null;
  const data = (await res.json().catch(() => null)) as ScanApiListResponse | null;
  const item = data?.items?.[0];
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
}

export interface DiscoveredAgent {
  agentId: string;
  tokenId: string;
  ownerAddress: string;
  ownerLabel: string | null;
  name: string;
  description: string | null;
  isVerified: boolean;
  totalScore: number;
  starCount: number;
  supportedProtocols: string[];
  x402Supported: boolean;
  createdAt: string;
}

export interface DiscoveredAgentsPage {
  agents: DiscoveredAgent[];
  total: number;
}

/**
 * Every real agent registered on ERC-8004 on BSC Testnet — not filtered to
 * Backstop's own curated roster. This is the actual "discover any agent on
 * BNB Chain" surface the hackathon's own framing implies: an agent operator
 * registers permissionlessly on the standard registry, with no relationship
 * to Backstop required, and shows up here automatically. Distinct from
 * Backstop's own assurance-backed catalog (src/lib/agents.ts) — there's no
 * fee relationship, band data, or hire flow for these, only real identity
 * and reputation, which is exactly what this function returns and nothing
 * more. Confirmed live: 1,896+ real agents registered on testnet alone.
 */
export async function listRegisteredAgents(limit = 12): Promise<DiscoveredAgentsPage> {
  const res = await fetchScanApi("/agents", {
    chain_id: String(BSC_TESTNET_CHAIN_ID),
    limit: String(limit),
  });
  if (!res) return { agents: [], total: 0 };
  const data = (await res.json().catch(() => null)) as ScanApiListResponse | null;
  if (!data) return { agents: [], total: 0 };
  return {
    total: data.total,
    agents: data.items.map((item) => ({
      agentId: item.agent_id,
      tokenId: item.token_id,
      ownerAddress: item.owner_address,
      ownerLabel: item.owner_ens ?? item.owner_username ?? null,
      name: item.name,
      description: item.description,
      isVerified: item.is_verified,
      totalScore: item.total_score,
      starCount: item.star_count,
      supportedProtocols: item.supported_protocols ?? [],
      x402Supported: item.x402_supported,
      createdAt: item.created_at,
    })),
  };
}
