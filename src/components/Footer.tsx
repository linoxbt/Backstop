import { Seal } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-steel text-paper-on-steel mt-auto">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 grid gap-10 sm:grid-cols-[1fr_auto]">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Seal size={30} tone="paper" />
            <span className="font-display text-xl">Backstop</span>
          </div>
          <p className="font-body text-sm text-paper-on-steel/70 max-w-md leading-relaxed">
            An assurance pool for BNB Chain&rsquo;s autonomous agents. Every hire is measured
            against a verified performance band; every miss pays out automatically, on-chain,
            under the same manifest shown at hire.
          </p>
        </div>
        <div className="font-data text-[11px] uppercase tracking-wider text-paper-on-steel/60 space-y-2">
          <p>Built for The Smart Money Era — BNB Chain</p>
          <p>BSC Testnet build, mainnet at judging</p>
          <p>Sessions registered in Altana Keystore</p>
        </div>
      </div>
    </footer>
  );
}
