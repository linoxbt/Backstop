"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { DarkSeal } from "@/components/Logo";
import { CATEGORY_IMAGE } from "@/lib/categoryImages";

const ROTATION_MS = 4200;
const IMAGES = Object.values(CATEGORY_IMAGE);

/**
 * The huge, slowly-turning background watermark behind GuaranteeReveal's
 * text — the Backstop mark and the same four category photographs shown
 * later on the page (CategoryShowcase), oversized and cycling one at a
 * time. Each layer crossfades with a distinct scale+rotation on the way in
 * and a different one on the way out, so it reads as one turning away while
 * the next arrives rather than a flat crossfade. A translucent tint sits
 * between this layer and the real content in front of it — deliberately
 * lighter than the fully-opaque dark sections elsewhere on the page, so the
 * imagery still shows through.
 */
export function HeroWatermark() {
  const [active, setActive] = useState(0);
  const total = IMAGES.length + 1; // + the mark itself

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setActive((v) => (v + 1) % total);
    }, ROTATION_MS);
    return () => window.clearInterval(id);
  }, [total]);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* index 0: the mark */}
      <WatermarkLayer isActive={active === 0}>
        <DarkSeal size={620} />
      </WatermarkLayer>

      {IMAGES.map((img, i) => (
        <WatermarkLayer key={img.src} isActive={active === i + 1}>
          <div className="relative w-[150vw] h-[150vw] sm:w-[85vw] sm:h-[85vw] max-w-[1400px] max-h-[1400px]">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="150vw"
              className="object-cover rounded-full grayscale contrast-125"
            />
          </div>
        </WatermarkLayer>
      ))}

      {/* Tint — lighter than the site's usual opaque dark sections, so the
          rotating imagery still reads through behind the real content. */}
      <div className="absolute inset-0 bg-[var(--color-momento-bg-deep)]/70" />
    </div>
  );
}

function WatermarkLayer({ isActive, children }: { isActive: boolean; children: React.ReactNode }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center transition-all ease-[cubic-bezier(0.16,1,0.3,1)] duration-[1400ms]"
      style={{
        opacity: isActive ? 0.5 : 0,
        transform: isActive ? "scale(1) rotate(0deg)" : "scale(1.35) rotate(18deg)",
      }}
    >
      {children}
    </div>
  );
}
