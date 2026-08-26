"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENU_LINKS } from "@/lib/navLinks";
import { DarkSeal } from "./Logo";

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
 * Hamburger toggle + full-viewport takeover panel. The panel is a glass
 * overlay (a translucent dark fill plus a heavy backdrop-blur), not a solid
 * opaque one — whatever page is behind it reads only as a blurred wash of
 * color, never legible, while the panel's own content (the Backstop mark +
 * wordmark, then the nav list) is fully sharp and centered both axes. The
 * mark sits above the nav list as its own beat, not inline with it.
 *
 * The overlay is portaled to `document.body` rather than rendered inline
 * where the toggle button lives, in `<header>`. Header's own "light" tone
 * state uses `backdrop-blur` (backdrop-filter) — and per the CSS spec, a
 * `filter`/`backdrop-filter` ancestor establishes a new containing block
 * for `position: fixed` descendants, exactly like `transform` does. Since
 * `<header>` itself has no explicit height (it shrink-wraps to its 76px
 * inner bar), that trapped this overlay's `fixed inset-0` inside a 76px box
 * instead of the real viewport whenever the header wasn't in its dark/no-
 * blur state — confirmed via getComputedStyle showing the overlay's own
 * height resolving to exactly 76px. Portaling escapes that ancestor
 * entirely, so `fixed inset-0` here always means the true viewport.
 */
export function NavMenu({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // `document.body` doesn't exist during SSR, and the server-rendered
    // markup must match the client's first render exactly to avoid a
    // hydration mismatch -- so the portal only mounts after this effect
    // confirms we're on the client, one render later, same pattern as
    // useHeaderTone.ts's own initial-state correction.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    // `overflow: hidden` alone locks scrolling but never resets the body's
    // existing scroll offset -- on a page the user had already scrolled
    // down, this fixed inset-0 panel is still viewport-relative (correct),
    // but nothing here forces the browser to treat "the viewport" as
    // starting from the current scroll position rather than the top of the
    // document, which is exactly the bug this centering ticket described:
    // the panel visually reads as pinned near the top of the *document*
    // rather than centered in the *visible* viewport, most reliably
    // reproducible on mobile Safari. Actually pinning body itself to
    // `position: fixed` at a negative top offset while open removes the
    // ambiguity entirely -- the document can't scroll underneath at all
    // while the panel is up, and restoring scrollTo on close puts the user
    // back exactly where they were, not at the top of the page.
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      window.scrollTo(0, scrollY);
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

      {mounted &&
        createPortal(
          <div
            className={`fixed inset-0 z-50 bg-[var(--color-momento-bg)]/85 backdrop-blur-2xl transition-opacity duration-300 ${
              open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden={!open}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              tabIndex={open ? 0 : -1}
              className="absolute top-0 right-0 px-5 sm:px-8 h-[76px] flex items-center"
            >
              <span className="flex items-center justify-center size-10 rounded-full border border-white/30 hover:border-white transition-colors">
                <MenuGlyph open dark />
              </span>
            </button>

            <div className="h-full flex flex-col items-center justify-center gap-10 sm:gap-14 px-6">
              <div
                className={`flex items-center gap-3 ${open ? "animate-fade-rise" : ""}`}
                style={open ? { animationFillMode: "backwards" } : undefined}
              >
                <DarkSeal size={36} />
                <span className="font-display text-2xl text-white tracking-tight">Backstop</span>
              </div>

              <nav className="flex flex-col items-center gap-1 sm:gap-2">
                {MENU_LINKS.map((item, i) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    tabIndex={open ? 0 : -1}
                    onClick={() => setOpen(false)}
                    className={`font-display text-4xl sm:text-6xl text-white hover:text-bronze-bright transition-colors ${
                      open ? "animate-fade-rise" : ""
                    }`}
                    style={
                      open
                        ? { animationDelay: `${(i + 1) * 60}ms`, animationFillMode: "backwards" }
                        : undefined
                    }
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
