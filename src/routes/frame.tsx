import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FRAMES, type FrameId } from "@/lib/packages";
import { FrameCanvas } from "@/components/frame-canvas";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/frame")({
  component: FramePage,
  head: () => ({
    meta: [
      { title: "Pilih Frame Photobooth — SnapBooth Studio" },
      { name: "description", content: "Pilih template frame photobooth favoritmu: Vintage Telephone, Every Moment Blue, Pixie Film Cinema, Good Times Newspaper." },
    ],
  }),
});

function FramePage() {
  const [selectedFrame, setSelectedFrame] = useState<FrameId>("every-moment-blue");
  const frame = FRAMES.find((f) => f.id === selectedFrame)!;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "var(--gradient-mesh)" }} />
        <div className="mx-auto max-w-7xl px-4 pt-14 pb-6 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Frame Collection</p>
          <h1 className="mt-3 text-5xl font-bold leading-tight sm:text-6xl">
            Pilih <span className="font-display italic text-gradient-blue">Frame Photobooth</span>
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Pilih frame favoritmu dan lihat hasil foto langsung sebelum datang ke studio. 4 template eksklusif menunggu.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          {/* Frame cards */}
          <div className="space-y-4">
            {FRAMES.map((f, i) => {
              const active = selectedFrame === f.id;
              return (
                <motion.button
                  key={f.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedFrame(f.id)}
                  className={cn(
                    "group w-full overflow-hidden rounded-3xl border p-6 text-left transition-all hover:-translate-y-1",
                    active
                      ? "border-primary bg-primary/10 shadow-xl shadow-primary/20 glow-border-blue"
                      : "border-border bg-card/60 hover:border-primary/40",
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* Frame mini preview */}
                    <div
                      className="h-20 w-14 shrink-0 overflow-hidden rounded-xl flex flex-col shadow-lg"
                      style={{
                        background: `linear-gradient(145deg, ${f.secondaryColor}, ${f.secondaryColor}90)`,
                        border: `2px solid ${f.primaryColor}40`,
                      }}
                    >
                      <div
                        className="flex-1 flex items-center justify-center text-2xl"
                      >
                        {f.emoji}
                      </div>
                      <div
                        className="py-1 text-center text-[8px] font-bold"
                        style={{ backgroundColor: f.primaryColor, color: f.secondaryColor }}
                      >
                        {f.badge}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold">{f.name}</h3>
                        <span
                          className={cn(
                            "rounded-full px-3 py-0.5 text-xs font-bold uppercase",
                            active
                              ? "bg-primary text-primary-foreground"
                              : "border border-border bg-secondary text-muted-foreground",
                          )}
                        >
                          {f.badge}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{f.description}</p>
                    </div>

                    {active && (
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                        ✓
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}

            {/* CTA */}
            <div className="flex flex-wrap gap-3 pt-4">
              <Link
                to="/booking"
                className="btn-glow inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-primary-foreground"
              >
                Gunakan Frame Ini di Booking <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/kamera"
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold transition hover:border-primary/40"
              >
                Coba dengan Kamera
              </Link>
            </div>
          </div>

          {/* Live preview */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-card/60 p-5">
              <p className="mb-4 text-xs uppercase tracking-wider text-muted-foreground">Preview Frame</p>
              <div
                className="mb-4 rounded-2xl border-2 p-1 transition-all duration-300"
                style={{ borderColor: `${frame.primaryColor}60` }}
              >
                <FrameCanvas
                  key={selectedFrame}
                  frameId={selectedFrame}
                  photos={[]}
                  width={380}
                  className="w-full rounded-xl"
                />
              </div>
              <div className="rounded-2xl border border-border bg-background/40 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{frame.emoji}</span>
                  <div>
                    <p className="font-semibold">{frame.name}</p>
                    <p className="text-xs text-muted-foreground">Tema {frame.badge}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{frame.description}</p>
              </div>
              <Link
                to="/kamera"
                className="mt-4 block rounded-full bg-primary/10 py-3 text-center text-sm font-semibold text-primary transition hover:bg-primary/20"
              >
                Coba dengan Kamera Langsung
              </Link>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
