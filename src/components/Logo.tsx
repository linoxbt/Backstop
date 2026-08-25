export function Seal({ size = 40, tone = "ink" }: { size?: number; tone?: "ink" | "paper" }) {
  const ring = tone === "ink" ? "border-ink" : "border-paper-on-steel";
  const inner = tone === "ink" ? "border-bronze-text" : "border-bronze-bright";
  const fill = tone === "ink" ? "bg-bronze-text" : "bg-bronze-bright";
  return (
    <div
      className={`relative shrink-0 rounded-full border-[1.5px] ${ring}`}
      style={{ width: size, height: size }}
    >
      <div className={`absolute inset-[15%] rounded-full border ${inner}`} />
      <div
        className={`wedge-marker absolute ${fill}`}
        style={{
          width: size * 0.22,
          height: size * 0.32,
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
        }}
      />
    </div>
  );
}

export function Wordmark({ tone = "ink" }: { tone?: "ink" | "paper" }) {
  const text = tone === "ink" ? "text-ink" : "text-paper-on-steel";
  return <span className={`font-display text-2xl ${text}`}>Backstop</span>;
}
