"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Seal, Wordmark } from "./Logo";
import { ConnectWalletButton } from "./ConnectWalletButton";
import { NavMenu } from "./NavMenu";

function NavLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative py-1 transition-colors ${
        active ? "text-ink" : "text-ink-soft hover:text-ink"
      } ${className}`}
    >
      {children}
      <span
        className={`absolute -bottom-[1px] left-0 right-0 h-px bg-bronze-text transition-opacity ${
          active ? "opacity-100" : "opacity-0"
        }`}
      />
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const enteredMarketplace = pathname !== "/";

  return (
    <header className="border-b border-stone-line bg-stone/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-[76px] flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 group">
          <Seal size={34} />
          <div className="hidden sm:block">
            <Wordmark />
          </div>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6 font-ui text-[13px] tracking-wide">
          <NavLink href="/my-agents">My Agents</NavLink>
          {enteredMarketplace && <ConnectWalletButton />}
          <NavMenu />
        </nav>
      </div>
    </header>
  );
}
