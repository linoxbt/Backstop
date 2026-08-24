import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategorySection } from "@/components/CategorySection";
import { CATEGORIES, agentsByCategory } from "@/lib/agents";

export default function MarketplacePage() {
  return (
    <>
      <Header />
      <main>
        <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-8">
          <h1 className="font-display text-3xl sm:text-4xl mb-5">Marketplace</h1>
          <nav className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                href={`#${c.id}`}
                className="font-data text-[11px] uppercase tracking-wider border border-stone-line px-3 py-1.5 text-ink-soft hover:border-bronze-text hover:text-bronze-text transition-colors"
              >
                {c.label}
              </Link>
            ))}
          </nav>
        </div>

        {CATEGORIES.map((category, i) => (
          <CategorySection
            key={category.id}
            category={category}
            agents={agentsByCategory(category.id)}
            index={i + 1}
          />
        ))}
      </main>
      <Footer />
    </>
  );
}
