/** Shared nav destinations — used by both NavMenu.tsx (client) and Footer.tsx (server). */
export const MENU_LINKS = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/pool", label: "Pool" },
  // "My Agents" is a top-level, always-visible header link from sm: up —
  // it only needs a home here so it stays reachable once the header hides
  // it below that breakpoint to make room for the wordmark.
  { href: "/my-agents", label: "My Agents" },
  { href: "/docs", label: "Docs" },
  { href: "/advantage-report", label: "Advantage Report" },
];
