"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENU_LINKS } from "@/lib/navLinks";

/**
 * The reference's menu glyph isn't three equal bars — the middle bar runs
 * near full width while the top and bottom bars are shorter and centered,
 * giving it a distinct tapered silhouette. Reimplemented here as plain
 * rects at the same proportions, not copied markup. `dark` recolors the
 * closed-state glyph for when it's floating over a page's dark masthead —
 * the open panel itself is always dark regardless (see NavMenu below).
 */
function MenuGlyph({ open, dark }: { open: boolean; dark: boolean }) {
  const barClass = dark ? "fill-white" : "fill-paper-ink";
  const lineClass = dark ? "stroke-white" : "stroke-paper-ink";
  return (
    <span className="relative block w-[18px] h-[14px]" aria-hidden="true">
      <svg
        viewBox="0 0 22 16"
        className={`absolute inset-0 size-full transition-all duration-300 ${
          open ? "opacity-0 scale-75" : "opacity-100 scale-100"
        }`}
      >
        <rect x="5.33" y="0" width="10.67" height="2.67" rx="1.33" className={barClass} />
        <rect x="1.33" y="6.67" width="18.67" height="2.67" rx="1.33" className={barClass} />
        <rect x="5.33" y="13.33" width="10.67" height="2.67" rx="1.33" className={barClass} />
      </svg>
      <svg
        viewBox="0 0 16 16"
        className={`absolute inset-0 m-auto size-4 transition-all duration-300 ${
          open ? "opacity-100 scale-100" : "opacity-0 scale-75"
        }`}
      >
        <line x1="1" y1="1" x2="15" y2="15" strokeWidth="2" strokeLinecap="round" className={lineClass} />
        <line x1="15" y1="1" x2="1" y2="15" strokeWidth="2" strokeLinecap="round" className={lineClass} />
      </svg>
    </span>
  );
}

/**
 * Hamburger toggle + full-screen takeover panel, replacing the header's
 * secondary links (Marketplace, Pool, Docs, Advantage Report) with a single
 * control — echoing the reference's own "collapse everything behind one
 * button" nav pattern. The open panel is always the dark momento register
 * now (it's a modal overlay, not tied to whatever page/tone sits behind
 * it) — `dark` only affects the closed button's appearance against
 * whatever the header currently looks like.
 */
export function NavMenu({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const t = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className={`flex items-center justify-center size-10 rounded-full border transition-colors shrink-0 ${
          dark ? "border-white/30 hover:border-white" : "border-paper-line hover:border-paper-ink"
        }`}
      >
        <MenuGlyph open={open} dark={dark} />
      </button>

      <div
        className={`fixed inset-x-0 top-[76px] h-[calc(100dvh-76px)] z-30 bg-[var(--color-momento-bg)] transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <nav className="max-w-6xl mx-auto px-5 sm:px-8 h-full flex flex-col justify-center gap-1 sm:gap-2">
          {MENU_LINKS.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              className={`font-display text-4xl sm:text-6xl text-white hover:text-bronze-bright transition-colors w-fit ${
                open ? "animate-fade-rise" : ""
              }`}
              style={
                open ? { animationDelay: `${i * 60}ms`, animationFillMode: "backwards" } : undefined
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
