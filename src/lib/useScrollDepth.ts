"use client";

import { useEffect, useRef } from "react";

const MAX_BLUR_PX = 14;

/**
 * JS fallback for the `.scroll-depth-blur` CSS class in globals.css (native
 * `animation-timeline: view()`) — only takes over where that isn't
 * supported. Writes `style.filter` directly rather than through state, so
 * scrolling never triggers a React re-render; cleans up its listener on
 * unmount, matching useInView's discipline. No-ops entirely under
 * prefers-reduced-motion, since it bypasses the CSS-only blanket override
 * in globals.css by writing the style property imperatively.
 */
export function useScrollDepth<T extends HTMLElement>(maxBlurPx = MAX_BLUR_PX) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof CSS !== "undefined" && CSS.supports?.("animation-timeline", "view()")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;

    function update() {
      ticking = false;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      // Matches the CSS keyframe's cover 0%-90% range: fully sharp until the
      // element is 40% of the way through its scroll-past, then blurs in.
      const progress = 1 - rect.top / viewportHeight;
      const clamped = Math.min(1, Math.max(0, (progress - 0.4) / 0.5));
      node.style.filter = clamped <= 0 ? "" : `blur(${(clamped * maxBlurPx).toFixed(1)}px)`;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (node) node.style.filter = "";
    };
  }, [maxBlurPx]);

  return { ref };
}
