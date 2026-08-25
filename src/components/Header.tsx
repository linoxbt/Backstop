"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Seal, DarkSeal } from "./Logo";
import { ConnectWalletButton } from "./ConnectWalletButton";
import { NavMenu } from "./NavMenu";
import { useHeaderTone } from "@/lib/useHeaderTone";

function NavLink({
  href,
  children,
  className = "",
  dark,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  dark: boolean;
}) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative py-1 transition-colors ${
        dark
          ? active
            ? "text-white"
            : "text-white/60 hover:text-white"
          : active
            ? "text-paper-ink"
            : "text-paper-ink-soft hover:text-paper-ink"
      } ${className}`}
    >
      {children}
      <span
        className={`absolute -bottom-[1px] left-0 right-0 h-px transition-opacity ${
          dark ? "bg-bronze-bright" : "bg-bronze-text"
        } ${active ? "opacity-100" : "opacity-0"}`}
      />
    </Link>
  );
}

/**
 * Tone-aware sitewide header. Every page gets exactly one dark momento
 * masthead near its top (see useHeaderTone.ts) — while that masthead is
 * near the viewport top, the header floats transparently over it (fixed,
 * white text, matching the reference's own floating nav); everywhere else
 * it's the original sticky bar. No border-bottom in either state — the
 * reference has no seam between its header and the page beneath it, so the
 * header reads as floating over one continuous surface, not a bar sitting
 * on top of it. Logo/wordmark always sits left (the reference centers its
 * own wordmark, but Backstop doesn't have a matching third nav element to
 * balance a centered layout against, so left-aligned is the honest choice
 * here, not a copy of the reference's exact position).
 */
export function Header() {
  const pathname = usePathname();
  const enteredMarketplace = pathname !== "/";
  const tone = useHeaderTone();
  const dark = tone === "dark";

  return (
    <header
      className={`inset-x-0 top-0 z-40 transition-colors duration-300 ${
        dark ? "fixed bg-transparent" : "sticky bg-paper/95 backdrop-blur"
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-[76px] flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
          {dark ? <DarkSeal size={30} /> : <Seal size={30} />}
          <span
            className={`font-display text-lg sm:text-2xl tracking-tight truncate ${
              dark ? "text-white" : "text-paper-ink"
            }`}
          >
            Backstop
          </span>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6 font-ui text-[13px] tracking-wide shrink-0">
          <NavLink href="/my-agents" className="hidden sm:inline-block" dark={dark}>
            My Agents
          </NavLink>
          {enteredMarketplace ? (
            <ConnectWalletButton dark={dark} />
          ) : (
            <Link
              href="/marketplace"
              className={`hidden sm:inline-block font-data text-xs uppercase tracking-wider rounded-lg px-4 py-2 transition-colors ${
                dark
                  ? "bg-bronze-bright text-[var(--color-momento-bg)] hover:bg-bronze-text"
                  : "bg-paper-ink text-paper hover:bg-bronze-text"
              }`}
            >
              Enter the marketplace
            </Link>
          )}
          <NavMenu dark={dark} />
        </nav>
      </div>
    </header>
  );
}
