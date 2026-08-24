import Link from "next/link";
import { Seal } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-steel text-paper-on-steel mt-auto">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Seal size={28} tone="paper" />
          <span className="font-display text-lg">Backstop</span>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 font-data text-[11px] uppercase tracking-wider text-paper-on-steel/60">
          <Link href="/marketplace" className="hover:text-paper-on-steel transition-colors">
            Marketplace
          </Link>
          <Link href="/pool" className="hover:text-paper-on-steel transition-colors">
            Pool
          </Link>
          <Link href="/docs" className="hover:text-paper-on-steel transition-colors">
            Docs
          </Link>
          <span>BSC Testnet</span>
        </nav>
      </div>
    </footer>
  );
}
