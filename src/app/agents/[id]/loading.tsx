import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

function Bar({ w = "100%", h = "1em" }: { w?: string; h?: string }) {
  return (
    <div
      className="hatch-corridor animate-pulse"
      style={{ width: w, height: h, opacity: 0.5 }}
      aria-hidden
    />
  );
}

export default function Loading() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-14 sm:py-20" aria-busy="true">
        <span className="sr-only">Loading agent record…</span>
        <Bar w="140px" h="0.7em" />

        <div className="mt-8 mb-10 space-y-4">
          <Bar w="60px" h="0.6em" />
          <Bar w="320px" h="2.4em" />
          <div className="space-y-2 max-w-2xl">
            <Bar />
            <Bar w="80%" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 py-6 border-y border-stone-line mb-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Bar w="50%" h="0.6em" />
              <Bar w="80%" h="0.85em" />
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-10 lg:gap-14">
          <div className="border border-stone-line p-6 space-y-6">
            <Bar w="120px" h="0.7em" />
            <Bar w="100%" h="3.5em" />
            <div className="flex gap-5">
              <Bar w="30%" />
              <Bar w="30%" />
              <Bar w="30%" />
            </div>
          </div>
          <div className="border border-stone-line p-6 space-y-4">
            <Bar w="100px" h="0.7em" />
            <Bar w="70%" h="1.4em" />
            <Bar w="100%" h="4em" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
