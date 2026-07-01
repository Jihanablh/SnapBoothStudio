import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PhotoMarquee } from "@/components/photo-marquee";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/galeri")({
  component: GaleriPage,
  head: () => ({
    meta: [
      { title: "Galeri & Frame Collection — SnapBooth Studio" },
      { name: "description", content: "Koleksi frame photobooth dan galeri hasil foto dari studio SnapBooth Studio. Vintage, Modern, Cinema, dan Newspaper." },
      { property: "og:title", content: "Galeri — SnapBooth Studio" },
    ],
  }),
});

type Cat = "All" | "Vintage" | "Blue Edition" | "Cinema" | "Newspaper";

const photos: { label: Exclude<Cat, "All">; emoji: string; title: string; bgClass: string; h?: string }[] = [
  { label: "Vintage", emoji: "📞", title: "Vintage Telephone Frame", bgClass: "from-red-950 to-stone-900", h: "row-span-2" },
  { label: "Blue Edition", emoji: "💙", title: "Every Moment Blue", bgClass: "from-blue-950 to-slate-900" },
  { label: "Cinema", emoji: "🎬", title: "Pixie Film Cinema", bgClass: "from-stone-900 to-amber-950" },
  { label: "Newspaper", emoji: "📰", title: "Good Times Today!", bgClass: "from-neutral-900 to-zinc-900", h: "row-span-2" },
  { label: "Vintage", emoji: "📞", title: "Red Phone Studio", bgClass: "from-red-900 to-rose-950" },
  { label: "Blue Edition", emoji: "💙", title: "Blue Moment Studio", bgClass: "from-sky-950 to-blue-950" },
  { label: "Cinema", emoji: "🎬", title: "Cinema Night Shot", bgClass: "from-amber-950 to-stone-950", h: "row-span-2" },
  { label: "Vintage", emoji: "📞", title: "Retro Portrait", bgClass: "from-red-950 to-zinc-900" },
  { label: "Newspaper", emoji: "📰", title: "Gazette Edition", bgClass: "from-zinc-900 to-neutral-950" },
  { label: "Blue Edition", emoji: "💙", title: "Modern Sporty", bgClass: "from-blue-900 to-indigo-950", h: "row-span-2" },
  { label: "Cinema", emoji: "🎬", title: "Film Noir Style", bgClass: "from-stone-950 to-amber-900" },
  { label: "Vintage", emoji: "📞", title: "Classic Red Edition", bgClass: "from-rose-950 to-red-950" },
];

const CATS: Cat[] = ["All", "Vintage", "Blue Edition", "Cinema", "Newspaper"];

function GaleriPage() {
  const [cat, setCat] = useState<Cat>("All");
  const filtered = useMemo(
    () => (cat === "All" ? photos : photos.filter((p) => p.label === cat)),
    [cat],
  );

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "var(--gradient-mesh)" }} />
        <div className="mx-auto max-w-7xl px-4 pt-14 pb-6 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Galeri & Frame Collection</p>
          <h1 className="mt-3 text-5xl font-bold leading-tight sm:text-6xl">
            Frame estetik{" "}
            <span className="font-display italic text-gradient-luxury">pilihan studio kami</span>
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Lihat koleksi frame photobooth dan preview hasil foto di setiap tema studio kami.
          </p>
        </div>
      </section>

      <section className="border-y border-white/5 bg-black/30 py-4">
        <PhotoMarquee />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6">
        {/* Filter tabs */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                cat === c
                  ? "border-primary/60 bg-gradient-to-r from-primary/20 to-accent/20 text-foreground shadow-lg shadow-primary/20"
                  : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Masonry-like grid */}
        <div className="grid auto-rows-[200px] grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p, i) => (
            <motion.figure
              key={`${p.title}-${i}`}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: (i % 8) * 0.05 }}
              className={cn(
                "group relative overflow-hidden rounded-3xl border border-white/10",
                p.h,
              )}
            >
              <div className={`h-full w-full bg-gradient-to-br ${p.bgClass} flex items-center justify-center relative`}>
                <div className="text-center">
                  <div className="text-6xl group-hover:scale-110 transition-transform duration-700">{p.emoji}</div>
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-3 items-end gap-2 p-4 text-sm font-semibold text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  {p.title}
                </figcaption>
                <span className="pointer-events-none absolute right-3 top-3 rounded-full border border-white/20 bg-black/40 px-2.5 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur opacity-0 transition group-hover:opacity-100">
                  {p.label}
                </span>
              </div>
            </motion.figure>
          ))}
        </div>

        {/* Frame CTA */}
        <div className="mt-14 text-center">
          <h2 className="text-2xl font-bold">Mau lihat frame secara detail dan coba preview?</h2>
          <p className="mt-2 text-muted-foreground">Kunjungi halaman Frame Collection atau coba langsung dengan kamera.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/frame"
              className="btn-glow inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              Pilih Frame <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/kamera"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold transition hover:border-primary/40"
            >
              Coba Kamera
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
