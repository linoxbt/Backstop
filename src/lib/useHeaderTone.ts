"use client";

import { useLayoutEffect, useState } from "react";

/**
 * Watches every `[data-tone="dark"]` section on the current page and
 * reports whether one is currently near the top of the viewport, so
 * Header.tsx can switch from its default light bar to a transparent
 * white-on-dark treatment while floating over a page's dark momento
 * masthead. Unlike useInView, this never disconnects — it's a continuous
 * scrollspy, not a one-shot reveal trigger. Pages with no dark section
 * (nothing tagged) always report "light", so untouched pages don't regress.
 *
 * Always starts at "light" (matching the server-rendered HTML exactly, so
 * there's no hydration mismatch to reconcile — React does not reliably
 * patch a *structural* mismatch, like swapping the Seal/DarkSeal mark, the
 * way it does a plain text node) and corrects synchronously in a layout
 * effect before the browser paints, so a page with a dark masthead never
 * actually shows the wrong header, even for a frame.
 *
 * The structural DOM check (not an intersection check) is what makes the
 * initial correction possible at all: an intersection-based check would be
 * circular on first render, since the header only stops reserving its own
 * 76px of layout space once tone is "dark" — a dark section right at the
 * top would otherwise always measure as pushed down by that same 76px
 * before the check meant to remove it ever runs.
 */
export function useHeaderTone(): "light" | "dark" {
  const [tone, setTone] = useState<"light" | "dark">("light");

  useLayoutEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-tone="dark"]'));
    if (nodes.length === 0 || typeof IntersectionObserver === "undefined") return;

    const main = document.querySelector("main");
    if (main?.firstElementChild?.getAttribute("data-tone") === "dark") {
      // Deliberate: this is the one-time, DOM-structure-dependent initial
      // correction described above, not a value derivable from props/state
      // that belongs in the render itself — it can only be known once this
      // component (and its siblings) exist in the DOM. Layout effect timing
      // is what keeps this pre-paint rather than a visible flash.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTone("dark");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const anyDarkNearTop = entries.some((entry) => entry.isIntersecting);
        setTone(anyDarkNearTop ? "dark" : "light");
      },
      // A thin band pinned to the header's own height — a dark section only
      // counts once it's actually behind where the header sits, not merely
      // visible somewhere on screen.
      { rootMargin: "-1px 0px -95% 0px", threshold: 0 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return tone;
}
