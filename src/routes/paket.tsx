import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PACKAGES, ADDONS, formatIDR } from "@/lib/packages";
import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/paket")({
  component: PaketPage,
  head: () => ({
    meta: [
      { title: "Paket Sewa Studio — SnapBooth Studio" },
      { name: "description", content: "Pilih paket sewa studio photobooth. Quick Shot 30 menit, Studio Hour 1 jam, Full Experience 2 jam." },
    ],
  }),
});

function PaketPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "var(--gradient-mesh)" }} />
        <div className="mx-auto max-w-7xl px-4 pt-14 pb-6 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Paket Sewa Studio</p>
          <h1 className="mt-3 text-5xl font-bold leading-tight sm:text-6xl">
            Pilih paket{" "}
            <span className="font-display italic text-gradient-blue">sesuai kebutuhanmu</span>
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Semua paket sudah termasuk akses studio, frame pilihan, dan file digital. Tidak ada biaya tersembunyi.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6">
        {/* Package cards — proper spacing for badge */}
        <div className="grid gap-8 md:grid-cols-3">
          {PACKAGES.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="relative pt-5"
            >
              {/* Badge — outside and above card */}
              {p.badge && (
                <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2">
                  <span className={`inline-block whitespace-nowrap rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider shadow-lg ${
                    p.recommended
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-primary/40"
                      : "border border-primary/40 bg-card text-primary"
                  }`}>
                    {p.recommended && "⭐ "}{p.badge}
                  </span>
                </div>
              )}

              {/* Card */}
              <div className={`group relative h-full overflow-hidden rounded-3xl border p-8 transition-all hover:-translate-y-1.5 hover:shadow-2xl ${
                p.recommended
                  ? "border-primary/60 bg-gradient-to-b from-primary/10 via-card to-card shadow-xl shadow-primary/20"
                  : "border-border bg-card/80 hover:border-primary/40"
              }`}>
                {/* Glow top for recommended */}
                {p.recommended && (
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
                )}

                {/* Package name */}
                <div className="mb-1">
                  <h2 className="text-xl font-bold">{p.name}</h2>
                  <p className="text-xs text-muted-foreground">{p.tagline}</p>
                </div>

                {/* Price */}
                <div className="my-5 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-gradient-blue">{formatIDR(p.price)}</span>
                  <span className="text-sm text-muted-foreground">/ sesi</span>
                </div>

                {/* Duration & guest badges */}
                <div className="mb-5 flex flex-wrap gap-2">
                  <span className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium">
                    ⏱ {p.duration}
                  </span>
                  <span className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium">
                    👥 Maks. {p.maxGuest} orang
                  </span>
                </div>

                {/* Features */}
                <ul className="mb-8 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${p.recommended ? "text-primary" : "text-muted-foreground"}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA button — always at bottom */}
                <Link
                  to="/booking"
                  search={{ pkg: p.id }}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition-all ${
                    p.recommended
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50"
                      : "border border-white/15 bg-white/5 hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  Pilih Paket Ini →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add-ons info */}
        <div className="mt-14 rounded-3xl border border-border bg-card/60 p-8">
          <h2 className="text-xl font-bold mb-1">Tersedia Add-on Tambahan</h2>
          <p className="text-sm text-muted-foreground mb-6">Tambahkan layanan ekstra saat melakukan booking.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ADDONS.map((a) => (
              <div key={a.id} className="rounded-2xl border border-border bg-background/40 p-4">
                <p className="font-semibold text-sm">{a.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>
                <p className="mt-2 font-bold text-primary">+{formatIDR(a.price)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
