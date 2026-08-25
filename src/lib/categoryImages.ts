import type { AgentCategory } from "@/lib/types";

/**
 * One real, properly-licensed (Unsplash License — free commercial use, no
 * attribution required) photo per category, chosen for what the category
 * actually does rather than anything literal about "law" or "finance" in
 * the abstract: a security net for the agent that manages grid orders (the
 * literal meaning of "backstop" — a net that catches), precision clockwork
 * for the agent that resets a drifting range, a bank's safe-deposit
 * drawers for value routing, and a red ink stamp for the same rebate-stamp
 * visual already used elsewhere in this app (AssuranceBandInteractive.tsx).
 * Shared between CategoryShowcase.tsx and HeroWatermark.tsx.
 */
export const CATEGORY_IMAGE: Record<AgentCategory, { src: string; alt: string }> = {
  rebalancing: {
    // Photo by Isis França on Unsplash — https://unsplash.com/photos/hsPFuudRg5I
    src: "https://images.unsplash.com/photo-1524514587686-e2909d726e9b",
    alt: "",
  },
  "grid-trading": {
    // Photo by Lerone Pieters on Unsplash — https://unsplash.com/photos/bareXZyt-7Q
    src: "https://images.unsplash.com/photo-1546229738-ed21fb6e3158",
    alt: "",
  },
  yield: {
    // Photo by Jason Pofahl on Unsplash — https://unsplash.com/photos/zLtXrNXJpKM
    src: "https://images.unsplash.com/photo-1565126111587-f9fb04a432e4",
    alt: "",
  },
  "health-factor": {
    // Photo by Valeria Reverdo on Unsplash — https://unsplash.com/photos/rKluCY7dPN4
    src: "https://images.unsplash.com/photo-1648994605501-fe0a391d2653",
    alt: "",
  },
};
