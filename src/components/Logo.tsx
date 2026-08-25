export function Seal({ size = 40, tone = "ink" }: { size?: number; tone?: "ink" | "paper" }) {
  const outer = tone === "ink" ? "stroke-ink" : "stroke-paper-on-steel";
  const inner = tone === "ink" ? "stroke-bronze-text" : "stroke-bronze-bright";
  const fill = tone === "ink" ? "fill-bronze-text" : "fill-bronze-bright";
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
        className={outer}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M24 9 L34 12.5 V21.5 C34 30 29.5 35.8 24 38.7 C18.5 35.8 14 30 14 21.5 V12.5 Z"
        className={inner}
        strokeWidth="1"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <path d="M24 18.5 L28.7 24 L24 29.5 L19.3 24 Z" className={fill} />
    </svg>
  );
}

export function Wordmark({ tone = "ink" }: { tone?: "ink" | "paper" }) {
  const text = tone === "ink" ? "text-ink" : "text-paper-on-steel";
  return <span className={`font-display text-2xl tracking-tight ${text}`}>Backstop</span>;
}
