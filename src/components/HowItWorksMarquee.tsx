const PHRASES = ["DISCOVER", "HIRE", "BAND COMMITS ONCHAIN", "MISS IT, GET PAID BACK"];

/**
 * A continuous ticker banner, Agentic Market's closing "GET RESULTS ->
 * DISCOVER -> PAY ->" position — real Backstop language (the same
 * three-step guarantee GuaranteeSteps.tsx states elsewhere), not invented
 * marketing copy. The phrase list is rendered twice back-to-back so the
 * `-50%` translate in globals.css's `.animate-marquee` loops seamlessly.
 * Sits on the dark momento register — an uppercase marquee over oxblood reads
 * as premium editorial and gives the marketplace page a second dark beat
 * before its closing guarantee section.
 */
export function HowItWorksMarquee() {
  const track = [...PHRASES, ...PHRASES];
  return (
    <div
      data-tone="dark"
      className="border-y border-[var(--color-momento-line)] bg-[var(--color-momento-bg)] overflow-hidden py-6 sm:py-8"
    >
      <div className="flex w-max animate-marquee">
        {[0, 1].map((rep) => (
          <div key={rep} className="flex items-center shrink-0" aria-hidden={rep === 1}>
            {track.map((phrase, i) => (
              <span key={`${rep}-${i}`} className="flex items-center shrink-0">
                <span className="font-display text-2xl sm:text-4xl uppercase text-white px-4 sm:px-6 whitespace-nowrap">
                  {phrase}
                </span>
                <span className="text-bronze-bright text-2xl sm:text-4xl" aria-hidden="true">
                  →
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
