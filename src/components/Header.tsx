import Link from "next/link";
import { Seal, Wordmark } from "./Logo";

export function Header() {
  return (
    <header className="border-b border-stone-line bg-stone/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-[76px] flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 group">
          <Seal size={34} />
          <div className="hidden sm:block">
            <Wordmark />
          </div>
        </Link>
        <nav className="flex items-center gap-6 sm:gap-8 font-ui text-[13px] tracking-wide">
          <Link href="/" className="text-ink-soft hover:text-ink transition-colors">
            Marketplace
          </Link>
          <Link href="/pool" className="text-ink-soft hover:text-ink transition-colors">
            Assurance Pool
          </Link>
          <Link href="/advantage-report" className="text-ink-soft hover:text-ink transition-colors hidden sm:inline">
            Advantage Report
          </Link>
          <button
            type="button"
            className="font-data text-[11px] uppercase tracking-wider border border-ink px-3 py-2 text-ink hover:bg-ink hover:text-stone transition-colors"
            title="Passkey wallet connect — wires to Altana session creation"
          >
            Connect wallet
          </button>
        </nav>
      </div>
    </header>
  );
}
