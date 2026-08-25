import Link from "next/link";
import { DarkSeal } from "./Logo";
import { MENU_LINKS } from "@/lib/navLinks";
import { STACK } from "@/lib/stack";

const PRODUCT_LINKS = MENU_LINKS.filter((l) =>
  ["/marketplace", "/pool", "/my-agents"].includes(l.href),
);
const RESOURCE_LINKS = MENU_LINKS.filter((l) => ["/docs", "/advantage-report"].includes(l.href));

/**
 * Sitewide, always-dark footer — real weight instead of a single thin row,
 * matching the reference's substantial closing section. Every zone is real
 * content Backstop already has (nav links, the actual protocol stack from
 * /docs, the real metadata tagline) — no invented contact/social links.
 */
export function Footer() {
  return (
    <footer className="bg-[var(--color-momento-bg)] mt-auto">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="grid gap-12 sm:grid-cols-[1.4fr_1fr_1fr] mb-14">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <DarkSeal size={30} />
              <span className="font-display text-xl text-white">Backstop</span>
            </div>
            <p className="font-body text-sm text-white/50 max-w-xs leading-relaxed">
              Hire autonomous rebalancing, grid trading, yield and health-factor agents on BSC —
              every hire measured against a verified performance band, backed by an on-chain
              assurance pool that pays out automatically when an agent misses.
            </p>
          </div>

          <div>
            <span className="font-data text-[10px] uppercase tracking-wider text-white/40 block mb-4">
              Product
            </span>
            <nav className="flex flex-col gap-2.5">
              {PRODUCT_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="font-ui text-sm text-white/70 hover:text-white transition-colors w-fit"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <span className="font-data text-[10px] uppercase tracking-wider text-white/40 block mb-4">
              Resources
            </span>
            <nav className="flex flex-col gap-2.5">
              {RESOURCE_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="font-ui text-sm text-white/70 hover:text-white transition-colors w-fit"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="border-t border-[var(--color-momento-line)] pt-8 mb-8">
          <span className="font-data text-[10px] uppercase tracking-wider text-white/40 block mb-4">
            Stack
          </span>
          <div className="flex flex-wrap gap-x-8 gap-y-3 font-data text-[11px] text-white/50">
            {STACK.map(([label, value]) => (
              <span key={label}>
                <span className="text-white/30">{label}</span> {value}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-[var(--color-momento-line)] pt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="font-forum text-lg text-white/80">
            Every hire, measured against a promise. Every miss, paid back.
          </p>
          <p className="font-data text-[11px] text-white/30">
            © Backstop — BNB Agent Studio Marketplace · BSC Testnet
          </p>
        </div>
      </div>
    </footer>
  );
}
