const PHRASES = ["DISCOVER", "HIRE", "BAND COMMITS ON-CHAIN", "MISS IT, GET PAID BACK"];

/**
 * A continuous ticker banner, Agentic Market's closing "GET RESULTS ->
 * DISCOVER -> PAY ->" position — real Backstop language (the same
 * three-step guarantee GuaranteeSteps.tsx states elsewhere), not invented
 * marketing copy. The phrase list is rendered twice back-to-back so the
 * `-50%` translate in globals.css's `.animate-marquee` loops seamlessly.
 */
export function HowItWorksMarquee() {
  const track = [...PHRASES, ...PHRASES];
  return (
    <div className="border-y border-paper-line bg-paper-raised/50 overflow-hidden py-6 sm:py-8">
      <div className="flex w-max animate-marquee">
        {[0, 1].map((rep) => (
          <div key={rep} className="flex items-center shrink-0" aria-hidden={rep === 1}>
            {track.map((phrase, i) => (
              <span key={`${rep}-${i}`} className="flex items-center shrink-0">
                <span className="font-display text-2xl sm:text-4xl uppercase px-4 sm:px-6 whitespace-nowrap">
                  {phrase}
                </span>
                <span className="text-bronze-text text-2xl sm:text-4xl" aria-hidden="true">
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
