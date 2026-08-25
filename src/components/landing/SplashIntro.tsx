"use client";

import { useEffect, useState } from "react";
import { DarkSeal } from "./DarkSeal";

const SESSION_KEY = "backstop-splash-seen";

/**
 * A once-per-session branded intro, gated by sessionStorage so it plays on
 * first landing and never again for the rest of that browser session (e.g.
 * navigating back to "/" from the marketplace doesn't replay it).
 */
export function SplashIntro() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

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
    const exitTimer = window.setTimeout(() => setExiting(true), 1300);
    const removeTimer = window.setTimeout(() => setVisible(false), 2000);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[linear-gradient(160deg,_var(--color-momento-bg)_0%,_var(--color-momento-bg-deep)_100%)] transition-opacity duration-700 ${
        exiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      <div className="animate-splash-zoom">
        <DarkSeal size={72} />
      </div>
    </div>
  );
}
