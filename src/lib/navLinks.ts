/**
 * Shared nav destinations — used by both NavMenu.tsx (client) and
 * Footer.tsx (server). This is the *only* place My Agents and Advantage
 * Report are reachable from the header at any breakpoint (see Header.tsx's
 * own doc comment) — they don't have a separate top-level link to keep in
 * sync with this list.
 */
export const MENU_LINKS = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/pool", label: "Pool" },
  { href: "/my-agents", label: "My Agents" },
  { href: "/docs", label: "Docs" },
  { href: "/advantage-report", label: "Advantage Report" },
];
