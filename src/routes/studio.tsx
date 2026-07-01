import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Users, CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { STUDIOS } from "@/lib/packages";

export const Route = createFileRoute("/studio")({
  component: StudioPage,
  head: () => ({
    meta: [
      { title: "Studio Photobooth — SnapBooth Studio" },
      { name: "description", content: "Pilih studio photobooth dengan tema favoritmu. Blue Moment, Vintage Red Phone, Pixie Cinema, dan Newspaper Classic." },
    ],
  }),
});

function StudioPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "var(--gradient-mesh)" }} />
        <div className="mx-auto max-w-7xl px-4 pt-14 pb-6 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Studio</p>
          <h1 className="mt-3 text-5xl font-bold leading-tight sm:text-6xl">
            Pilih <span className="font-display italic text-gradient-blue">Studio Favoritmu</span>
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Setiap studio punya tema, dekorasi, dan nuansa yang unik. Temukan yang paling sesuai dengan selera dan momenmu.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6">
        <div className="grid gap-10">
          {STUDIOS.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`group grid gap-0 overflow-hidden rounded-3xl border border-white/10 bg-card/60 lg:grid-cols-[400px_1fr] ${i % 2 === 1 ? "lg:[direction:rtl]" : ""}`}
            >
              {/* Studio visual */}
              <div className={`bg-gradient-to-br ${s.bgGradient} flex items-center justify-center min-h-[260px] relative overflow-hidden`}>
                <div className="text-center">
                  <div className="text-[120px] group-hover:scale-110 transition-transform duration-700">{s.emoji}</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute top-4 left-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  {s.theme}
                </div>
              </div>

              {/* Studio info */}
              <div className="p-8 lg:p-10" style={{ direction: "ltr" }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{s.emoji}</span>
                  <h2 className="text-3xl font-bold">{s.name}</h2>
                </div>

                <p className="text-lg text-muted-foreground leading-relaxed">{s.description}</p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    `Kapasitas: maks. ${s.capacity} orang`,
                    `Tema: ${s.theme}`,
                    "Tersedia semua frame",
                    "Pencahayaan studio profesional",
                    "Props tersedia",
                    "Backdrop tematik",
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Cocok untuk {s.capacity <= 2 ? "pasangan atau solo" : s.capacity <= 4 ? "kelompok kecil" : "kelompok besar atau keluarga"}</span>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/booking"
                    search={{ studio: s.id }}
                    className="btn-glow inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-primary-foreground"
                  >
                    Booking Studio Ini <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/kamera"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold transition hover:border-primary/40"
                  >
                    Coba Kamera
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
