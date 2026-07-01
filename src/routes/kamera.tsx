import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PhotoBoothCamera } from "@/components/photo-booth-camera";
import type { FrameId } from "@/lib/packages";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/kamera")({
  component: KameraPage,
  head: () => ({
    meta: [
      { title: "Try Photo Booth Camera — SnapBooth Studio" },
      { name: "description", content: "Coba pengalaman photobooth langsung dari browser kamu. Aktifkan kamera, pilih frame, dan ambil foto dengan countdown." },
    ],
  }),
});

function KameraPage() {
  const [selectedFrame, setSelectedFrame] = useState<FrameId>("every-moment-blue");

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "var(--gradient-mesh)" }} />
        <div className="mx-auto max-w-7xl px-4 pt-14 pb-6 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Try Photo Booth</p>
          <h1 className="mt-3 text-5xl font-bold leading-tight sm:text-6xl">
            Coba <span className="font-display italic text-gradient-blue">Kamera Langsung</span>
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Coba pengalaman photobooth langsung dari browser kamu. Aktifkan kamera, pilih frame, ambil foto, dan lihat hasilnya sebelum datang ke studio.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs text-primary">
              ✓ Countdown 3 detik
            </div>
            <div className="flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs text-primary">
              ✓ Flash effect otomatis
            </div>
            <div className="flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs text-primary">
              ✓ 4 template frame
            </div>
            <div className="flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs text-primary">
              ✓ Download hasil foto
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6">
        <PhotoBoothCamera
          selectedFrame={selectedFrame}
          onFrameSelect={setSelectedFrame}
        />

        {/* CTA after camera */}
        <div className="mt-10 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/5 p-8 text-center">
          <h2 className="text-2xl font-bold">Suka hasilnya? Yuk booking studio sekarang!</h2>
          <p className="mt-2 text-muted-foreground">
            Datang langsung ke studio dan nikmati pengalaman photobooth yang lebih premium dengan lighting profesional.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/booking"
              className="btn-glow inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-7 py-3.5 text-sm font-semibold text-primary-foreground"
            >
              Booking Studio <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/studio"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3.5 text-sm font-semibold transition hover:border-primary/40"
            >
              Lihat Studio
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
