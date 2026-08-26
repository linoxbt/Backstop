"use server";

import { listRegisteredAgents, type DiscoveredAgentsPage } from "@/lib/erc8004";

const MAX_PAGE_SIZE = 100;

/**
 * Client-callable pagination/search over the live ERC-8004 registry — a
 * thin server action wrapping erc8004.ts's server-only fetch, so
 * DiscoveredAgents.tsx (a client component, for the tab/search/pager
 * interactivity) can page through up to the registry's real total without
 * a full page navigation. Always fetches fresh (no revalidate override
 * here beyond what listRegisteredAgents already sets) since a "next page"
 * click implies the user wants the current state of the registry, not a
 * stale one from the initial server render.
 */
export async function fetchDiscoveredAgentsPage(input: {
  chainId: number;
  offset: number;
  search?: string;
}): Promise<DiscoveredAgentsPage> {
  const offset = Math.max(0, Math.floor(input.offset) || 0);
  return listRegisteredAgents(MAX_PAGE_SIZE, input.chainId, offset, input.search);
}
