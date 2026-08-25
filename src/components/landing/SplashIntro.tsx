"use client";

import { useEffect, useState } from "react";
import { DarkSeal } from "@/components/Logo";

const SESSION_KEY = "backstop-splash-seen";

/**
 * A once-per-session branded intro, gated by sessionStorage so it plays on
 * first landing and never again for the rest of that browser session (e.g.
 * navigating back to "/" from the marketplace doesn't replay it). Two
 * distinct motion beats, not one shared fade: the mark itself enters large
 * (blur+rotate+scale settling into place), a tagline follows it in, then on
 * exit the mark leaves first (scaling past full size and blurring away)
 * before the backdrop dims — matching the reference's own loading
 * experience rhythm rather than a single opacity crossfade.
 */
export function SplashIntro() {
  const [visible, setVisible] = useState(false);
  const [taglineVisible, setTaglineVisible] = useState(false);
  const [markExiting, setMarkExiting] = useState(false);
  const [backdropExiting, setBackdropExiting] = useState(false);

  useEffect(() => {
    let alreadySeen = true;
    try {
      alreadySeen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      alreadySeen = true; // storage unavailable — skip rather than risk a stuck overlay
    }
    if (alreadySeen) return;

    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // ignore — worst case the splash plays again next load
    }
    const showTimer = window.setTimeout(() => setVisible(true), 0);
    const taglineTimer = window.setTimeout(() => setTaglineVisible(true), 900);
    const markExitTimer = window.setTimeout(() => setMarkExiting(true), 2000);
    const backdropExitTimer = window.setTimeout(() => setBackdropExiting(true), 2450);
    const removeTimer = window.setTimeout(() => setVisible(false), 3150);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(taglineTimer);
      window.clearTimeout(markExitTimer);
      window.clearTimeout(backdropExitTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-[radial-gradient(120%_90%_at_50%_0%,_var(--color-momento-blue)_0%,_var(--color-momento-bg-deep)_45%,_var(--color-momento-bg)_100%)] transition-opacity duration-700 ${
        backdropExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      <div className={markExiting ? "animate-splash-mark-out" : "animate-splash-mark-in"}>
        <DarkSeal size={220} />
      </div>
      <p
        className={`font-forum text-white/70 text-lg sm:text-xl tracking-wide transition-opacity duration-500 ${
          taglineVisible && !markExiting ? "opacity-100" : "opacity-0"
        }`}
      >
        &ldquo;Backstop underwrites the outcome.&rdquo;
      </p>
    </div>
  );
}
