export function Seal({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className="shrink-0"
      aria-hidden="true"
    >
      <path
        d="M24 4 L39 9.5 V21.5 C39 32.5 33 40 24 44 C15 40 9 32.5 9 21.5 V9.5 Z"
        className="stroke-paper-ink"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M24 9 L34 12.5 V21.5 C34 30 29.5 35.8 24 38.7 C18.5 35.8 14 30 14 21.5 V12.5 Z"
        className="stroke-bronze-text"
        strokeWidth="1"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <path d="M24 18.5 L28.7 24 L24 29.5 L19.3 24 Z" className="fill-bronze-text" />
    </svg>
  );
}

export function Wordmark() {
  return <span className="font-display text-2xl tracking-tight text-paper-ink">Backstop</span>;
}

/**
 * Same shield mark as Seal, recolored for the dark momento register — now
 * used sitewide (Header when a dark masthead is behind it, Footer, NavMenu,
 * SplashIntro), not just the landing page.
 */
export function DarkSeal({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className="shrink-0"
      aria-hidden="true"
    >
      <path
        d="M24 4 L39 9.5 V21.5 C39 32.5 33 40 24 44 C15 40 9 32.5 9 21.5 V9.5 Z"
        stroke="white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M24 9 L34 12.5 V21.5 C34 30 29.5 35.8 24 38.7 C18.5 35.8 14 30 14 21.5 V12.5 Z"
        className="stroke-bronze-bright"
        strokeWidth="1"
        strokeLinejoin="round"
        opacity="0.7"
      />
      <path d="M24 18.5 L28.7 24 L24 29.5 L19.3 24 Z" className="fill-bronze-bright" />
    </svg>
  );
}
