"use client";

import { useEffect, useRef } from "react";

const EDGE_FRACTION = 0.12;

/**
 * Drives the Territories scroll sequence. There's a CSS-native attempt in
 * globals.css (`.category-sequence-*`, a named view-timeline per panel),
 * but it turned out unreliable in practice — verified via screenshot that
 * the named-timeline-consumed-by-a-descendant pattern doesn't bind
 * correctly in this environment's Chromium (all panels render at once,
 * overlapping, rather than one at a time), so this hook is the actual,
 * always-on mechanism rather than a fallback. It writes inline style
 * directly (which always wins over the dormant CSS rules regardless of
 * whether they happen to bind on a given browser) rather than through
 * React state, so scrolling never triggers a re-render. Computes scroll
 * progress through the tall wrapper element the same way the CSS "cover"
 * range would (0 when its top reaches the viewport bottom, 1 when its
 * bottom leaves the viewport top), splits that into `count` equal
 * segments, and fades/settles each panel in and out within its own segment.
 */
export function useScrollSequence<T extends HTMLElement>(count: number) {
  const wrapperRef = useRef<T | null>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      // Skip the scroll-scrubbed step sequence entirely — just make every
      // panel plainly visible rather than tying visibility to scroll
      // position at all.
      panelRefs.current.forEach((panel) => {
        if (panel) panel.style.opacity = "1";
      });
      return;
    }

    let ticking = false;

    function update() {
      ticking = false;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const total = rect.height + viewportHeight;
      const progress = Math.min(1, Math.max(0, (viewportHeight - rect.top) / total));
      const segment = 1 / count;

      panelRefs.current.forEach((panel, i) => {
        if (!panel) return;
        const start = i * segment;
        const local = (progress - start) / segment;
        let opacity = 0;
        if (local >= 0 && local <= 1) {
          if (local < EDGE_FRACTION) opacity = local / EDGE_FRACTION;
          else if (local > 1 - EDGE_FRACTION) opacity = (1 - local) / EDGE_FRACTION;
          else opacity = 1;
        }
        const offset = 24 * (1 - opacity);
        const scale = 0.92 + 0.08 * opacity;
        panel.style.opacity = String(opacity);
        panel.style.transform = `translateY(${offset}px) scale(${scale})`;
      });
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [count]);

  return { wrapperRef, panelRefs };
}
