import "server-only";
import { BSC_MAINNET_CHAIN_ID, BSC_TESTNET_CHAIN_ID } from "@bnbagent/sdk/networks";

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
 *
 * Confirmed live on both real BNB Chain networks (not just testnet):
 * chain_id=97 (BSC Testnet, 1,896+ registered agents) and chain_id=56
 * (BSC Mainnet, 284,000+ registered agents), same shared registry contract
 * family, same API shape either way.
 */

const SCAN_API_URL = "https://www.8004scan.io/api/v1";

export { BSC_MAINNET_CHAIN_ID, BSC_TESTNET_CHAIN_ID };

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

export type BnbNetwork = "bsc-testnet" | "bsc-mainnet";

export function networkForChainId(chainId: number): BnbNetwork {
  return chainId === BSC_MAINNET_CHAIN_ID ? "bsc-mainnet" : "bsc-testnet";
}

export interface DiscoveredAgent {
  agentId: string;
  tokenId: string;
  chainId: number;
  network: BnbNetwork;
  /** The real onchain address a hire's ERC-8183 job would be funded to. */
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
 * Every real agent registered on ERC-8004 on the given chain — not filtered
 * to Backstop's own curated roster. This is the actual "discover any agent
 * on BNB Chain" surface the hackathon's own framing implies: an agent
 * operator registers permissionlessly on the standard registry, with no
 * relationship to Backstop required, and shows up here automatically.
 * Distinct from Backstop's own assurance-backed catalog (src/lib/agents.ts)
 * — there's no fee relationship or band data for these, only real identity
 * and reputation. Confirmed live on both networks: 1,896+ real agents on
 * BSC Testnet, 284,000+ on BSC Mainnet.
 */
export async function listRegisteredAgents(
  limit = 12,
  chainId: number = BSC_TESTNET_CHAIN_ID,
  offset = 0,
  search?: string,
): Promise<DiscoveredAgentsPage> {
  const params: Record<string, string> = {
    chain_id: String(chainId),
    limit: String(limit),
    offset: String(offset),
  };
  // Confirmed against the live API: "search" does a real substring match
  // (over name/description); "name" and "q" are both silently ignored, so
  // this is the one param that actually filters — see DiscoveredAgents.tsx.
  if (search && search.trim()) params.search = search.trim();
  const res = await fetchScanApi("/agents", params);
  if (!res) return { agents: [], total: 0 };
  const data = (await res.json().catch(() => null)) as ScanApiListResponse | null;
  if (!data) return { agents: [], total: 0 };
  return {
    total: data.total,
    agents: data.items.map((item) => ({
      agentId: item.agent_id,
      tokenId: item.token_id,
      chainId,
      network: networkForChainId(chainId),
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

interface ScanApiServiceEntry {
  endpoint?: string;
  skills?: unknown[];
}

interface ScanApiHealthCheck {
  status: string;
  message: string;
  checked_at: string;
  latency_ms: number | null;
}

interface ScanApiAgentDetail {
  agent_id: string;
  token_id: string;
  chain_id: number;
  is_testnet: boolean;
  contract_address: string;
  name: string;
  description: string | null;
  image_url: string | null;
  owner_address: string;
  owner_ens: string | null;
  owner_username: string | null;
  agent_wallet: string | null;
  is_verified: boolean;
  is_active: boolean;
  star_count: number;
  watch_count: number;
  tags: string[];
  categories: string[];
  supported_protocols: string[];
  supported_trust_models: string[];
  services: Record<string, ScanApiServiceEntry> | null;
  x402_supported: boolean;
  a2a_endpoint: string | null;
  mcp_server: string | null;
  agent_url: string | null;
  total_score: number;
  average_score: number;
  rank: number | null;
  network_rank: number | null;
  total_feedbacks: number;
  total_validations: number;
  successful_validations: number;
  quality_score: number;
  popularity_score: number;
  activity_score: number;
  wallet_score: number;
  freshness_score: number;
  metadata_completeness_score: number;
  is_endpoint_verified: boolean;
  endpoint_verified_domain: string | null;
  health_score: number | null;
  health_status: {
    overall_status: string;
    services: Record<string, ScanApiHealthCheck>;
    checked_at: string;
  } | null;
  created_block_number: number | null;
  created_tx_hash: string | null;
  created_at: string;
  cross_chain_links: unknown[] | null;
}

export interface DiscoveredAgentDetail {
  agentId: string;
  tokenId: string;
  chainId: number;
  network: BnbNetwork;
  contractAddress: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  ownerAddress: string;
  ownerLabel: string | null;
  agentWallet: string | null;
  isVerified: boolean;
  isActive: boolean;
  starCount: number;
  watchCount: number;
  tags: string[];
  categories: string[];
  supportedProtocols: string[];
  supportedTrustModels: string[];
  services: { protocol: string; endpoint: string | null }[];
  x402Supported: boolean;
  a2aEndpoint: string | null;
  mcpServer: string | null;
  agentUrl: string | null;
  /** Reputation — real onchain-registered feedback, not a Backstop figure. */
  totalScore: number;
  averageScore: number;
  rank: number | null;
  networkRank: number | null;
  totalFeedbacks: number;
  totalValidations: number;
  successfulValidations: number;
  /** 8004scan's own composite quality signals, 0-100 each. */
  scoreBreakdown: {
    quality: number;
    popularity: number;
    activity: number;
    wallet: number;
    freshness: number;
    metadataCompleteness: number;
  };
  isEndpointVerified: boolean;
  endpointVerifiedDomain: string | null;
  healthScore: number | null;
  healthStatus: string | null;
  serviceHealth: { protocol: string; status: string; message: string }[];
  createdBlockNumber: number | null;
  createdTxHash: string | null;
  createdAt: string;
  hasCrossChainLinks: boolean;
}

/**
 * The real, full ERC-8004 record for one specific discovered agent — used
 * on its detail page (src/app/discovered/[chainId]/[contract]/[tokenId]).
 * This is identity + reputation data, exactly what the registry itself
 * tracks; it does NOT include job/payment history (completed jobs, volume,
 * fees, missed-and-refunded), because ERC-8004 is an identity/reputation
 * standard, not a job ledger — that distinction is surfaced honestly on the
 * page itself rather than glossed over. Returns `null` on any failure
 * (unregistered token, network error, non-200), same honest-null contract
 * as every other lookup in this module.
 */
export async function getDiscoveredAgentDetail(
  chainId: number,
  contractAddress: string,
  tokenId: string,
): Promise<DiscoveredAgentDetail | null> {
  let res: Response | null;
  try {
    const url = `${SCAN_API_URL}/agents/${chainId}/${contractAddress}/${tokenId}`;
    res = await fetch(url, {
      headers: process.env.EIGHT004SCAN_API_KEY
        ? { "X-API-Key": process.env.EIGHT004SCAN_API_KEY }
        : undefined,
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 300 },
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;
  const item = (await res.json().catch(() => null)) as ScanApiAgentDetail | null;
  if (!item) return null;

  const services = Object.entries(item.services ?? {}).map(([protocol, s]) => ({
    protocol,
    endpoint: s?.endpoint ?? null,
  }));
  const serviceHealth = Object.entries(item.health_status?.services ?? {}).map(
    ([protocol, h]) => ({ protocol, status: h.status, message: h.message }),
  );

  return {
    agentId: item.agent_id,
    tokenId: item.token_id,
    chainId: item.chain_id,
    network: networkForChainId(item.chain_id),
    contractAddress: item.contract_address,
    name: item.name,
    description: item.description,
    imageUrl: item.image_url,
    ownerAddress: item.owner_address,
    ownerLabel: item.owner_ens ?? item.owner_username ?? null,
    agentWallet: item.agent_wallet,
    isVerified: item.is_verified,
    isActive: item.is_active,
    starCount: item.star_count,
    watchCount: item.watch_count,
    tags: item.tags ?? [],
    categories: item.categories ?? [],
    supportedProtocols: item.supported_protocols ?? [],
    supportedTrustModels: item.supported_trust_models ?? [],
    services,
    x402Supported: item.x402_supported,
    a2aEndpoint: item.a2a_endpoint,
    mcpServer: item.mcp_server,
    agentUrl: item.agent_url,
    totalScore: item.total_score,
    averageScore: item.average_score,
    rank: item.rank,
    networkRank: item.network_rank,
    totalFeedbacks: item.total_feedbacks,
    totalValidations: item.total_validations,
    successfulValidations: item.successful_validations,
    scoreBreakdown: {
      quality: item.quality_score,
      popularity: item.popularity_score,
      activity: item.activity_score,
      wallet: item.wallet_score,
      freshness: item.freshness_score,
      metadataCompleteness: item.metadata_completeness_score,
    },
    isEndpointVerified: item.is_endpoint_verified,
    endpointVerifiedDomain: item.endpoint_verified_domain,
    healthScore: item.health_score,
    healthStatus: item.health_status?.overall_status ?? null,
    serviceHealth,
    createdBlockNumber: item.created_block_number,
    createdTxHash: item.created_tx_hash,
    createdAt: item.created_at,
    hasCrossChainLinks: Boolean(item.cross_chain_links && item.cross_chain_links.length > 0),
  };
}
