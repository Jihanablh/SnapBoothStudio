import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Camera,
  Calendar,
  CreditCard,
  FileSpreadsheet,
  LayoutDashboard,
  Sparkles,
  ArrowRight,
  MessageCircleWarning,
  ClockAlert,
  Wallet,
  FileWarning,
  Server,
  ShieldCheck,
  Network,
  Video,
  ImageIcon,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroScene } from "@/components/hero-scene";
import { HowItWorks } from "@/components/how-it-works";
import { PhotoMarquee } from "@/components/photo-marquee";
import { PACKAGES, STUDIOS, FRAMES, formatIDR } from "@/lib/packages";

export const Route = createFileRoute("/")(({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "SnapBooth Studio — Book Your Studio. Capture Your Moment." },
      { name: "description", content: "Sewa studio photobooth dengan tema unik, frame estetik, dan pengalaman foto langsung yang mudah dipesan secara online. Booking slot studio tanpa chat manual." },
      { property: "og:title", content: "SnapBooth Studio — Book Your Studio. Capture Your Moment." },
      { property: "og:description", content: "Sewa studio photobooth dengan tema unik. Booking mudah, frame eksklusif." },
    ],
  }),
}));

function LandingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <HeroScene />
      <MarqueeBand />
      <Problem />
      <HowItWorks />
      <StudioRooms />
      <Features />
      <Packages />
      <FrameCollection />
      <AwsSection />
      <CTA />
      <SiteFooter />
    </div>
  );
}

function MarqueeBand() {
  const items = [
    "💙 Blue Moment Studio",
    "📞 Vintage Red Phone",
    "🎬 Pixie Cinema Studio",
    "📰 Newspaper Classic",
    "📸 Frame Vintage",
    "🎨 Frame Modern",
    "🎞 Frame Cinema",
    "📄 Frame Newspaper",
  ];
  return (
    <section className="border-y border-white/5 bg-black/30 py-5 overflow-hidden">
      <div className="mb-3 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
        <span className="h-px w-8 bg-white/20" /> Studio Photobooth Rental <span className="h-px w-8 bg-white/20" />
      </div>
      <div className="flex animate-marquee gap-8 whitespace-nowrap" style={{ width: "max-content" }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-sm font-medium text-muted-foreground px-2">
            {item}
          </span>
        ))}
      </div>
      <div className="mt-3">
        <PhotoMarquee />
      </div>
    </section>
  );
}

function Problem() {
  const items = [
    { icon: MessageCircleWarning, t: "Booking manual via chat", d: "Cek jadwal sering tidak terlacak dengan baik." },
    { icon: ClockAlert, t: "Slot studio tumpang tindih", d: "Tidak ada sistem cek ketersediaan waktu otomatis." },
    { icon: Wallet, t: "Pembayaran sulit dipantau", d: "Status DP dan pelunasan tercecer di mana-mana." },
    { icon: FileWarning, t: "Rekap laporan berantakan", d: "Data sewa studio sulit direkap ke spreadsheet." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Masalah yang Kami Selesaikan</p>
          <h2 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
            Booking manual bikin jadwal{" "}
            <span className="font-display italic text-gradient-neon">mudah kacau</span>.
          </h2>
          <p className="mt-5 text-muted-foreground">
            Tidak perlu chat panjang hanya untuk cek jadwal. Pilih studio, tentukan slot, coba kamera, lalu konfirmasi booking dalam satu website.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((i, k) => (
            <motion.div
              key={i.t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: k * 0.08 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-primary/40 hover:bg-white/[0.06]"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary transition group-hover:scale-110">
                <i.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{i.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{i.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StudioRooms() {
  return (
    <section id="studio" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Studio Kami</p>
        <h2 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
          Pilih <span className="font-display italic text-gradient-blue">Studio Favoritmu</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          Setiap studio punya tema dan nuansa yang berbeda. Temukan yang paling cocok untukmu.
        </p>
      </div>
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STUDIOS.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-card/60 transition hover:-translate-y-2 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
          >
            {/* Studio preview */}
            <div className={`h-40 bg-gradient-to-br ${s.bgGradient} flex items-center justify-center relative overflow-hidden`}>
              <span className="text-7xl group-hover:scale-110 transition-transform duration-500">{s.emoji}</span>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold leading-tight">{s.name}</h3>
                <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {s.theme}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{s.description}</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>Maks. {s.capacity} orang</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  to="/studio"
                  className="flex-1 rounded-xl border border-border bg-secondary/50 py-2 text-center text-xs font-medium transition hover:border-primary/40"
                >
                  Detail
                </Link>
                <Link
                  to="/booking"
                  className="flex-1 rounded-xl bg-primary/10 py-2 text-center text-xs font-semibold text-primary transition hover:bg-primary/20"
                >
                  Booking
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: Calendar, t: "Booking jadwal online", d: "Pilih studio, tanggal, dan jam dalam hitungan detik." },
    { icon: LayoutDashboard, t: "Data booking rapi", d: "Semua tersimpan otomatis di dashboard admin." },
    { icon: CreditCard, t: "Status pembayaran jelas", d: "Pantau DP dan pelunasan tiap booking." },
    { icon: Video, t: "Kamera langsung di browser", d: "Coba photobooth sebelum datang ke studio." },
    { icon: ImageIcon, t: "Frame estetik pilihan", d: "4 template frame unik siap dipakai." },
    { icon: FileSpreadsheet, t: "Export ke spreadsheet", d: "Rekap booking siap dilaporkan kapan saja." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Keunggulan</p>
        <h2 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
          Semua yang dibutuhkan{" "}
          <span className="font-display italic text-gradient-luxury">studio modern</span>
        </h2>
      </div>
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i, k) => (
          <motion.div
            key={i.t}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: k * 0.06 }}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-7 transition hover:-translate-y-1.5 hover:border-primary/40"
          >
            <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl opacity-0 transition group-hover:opacity-100" />
            <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30 transition-transform group-hover:scale-110 group-hover:rotate-6">
              <i.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">{i.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{i.d}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Packages() {
  return (
    <section id="paket" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Paket Sewa Studio</p>
        <h2 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
          Pilih paket sesuai{" "}
          <span className="font-display italic text-gradient-neon">kebutuhanmu</span>
        </h2>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {PACKAGES.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className={`group relative rounded-3xl p-[1.5px] transition hover:-translate-y-2 ${
              p.recommended
                ? "bg-gradient-to-br from-primary via-accent to-primary shadow-2xl shadow-primary/30"
                : "bg-gradient-to-br from-white/15 via-white/5 to-white/10"
            }`}
          >
            <div className="relative h-full overflow-hidden rounded-[calc(1.5rem-1px)] bg-card/95 p-8 backdrop-blur">
              {p.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/50">
                  ⭐ {p.badge}
                </span>
              )}
              {p.badge && !p.recommended && (
                <span className="absolute right-4 top-4 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                  {p.badge}
                </span>
              )}
              <h3 className="text-2xl font-bold">
                {p.name}{" "}
                <span className="font-display italic text-muted-foreground">Studio</span>
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
              <div className="mt-6 flex items-end gap-1">
                <span className="text-4xl font-extrabold text-gradient-blue">{formatIDR(p.price)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                / sesi · {p.duration} · maks. {p.maxGuest} orang
              </p>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-accent/30 text-primary">
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/booking"
                search={{ pkg: p.id }}
                className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all ${
                  p.recommended
                    ? "btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground"
                    : "border border-white/15 bg-white/5 hover:border-primary/60 hover:bg-white/10"
                }`}
              >
                Pilih Paket <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FrameCollection() {
  return (
    <section id="frame" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Frame Collection</p>
        <h2 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
          Pilih frame favoritmu dan lihat hasil foto{" "}
          <span className="font-display italic text-gradient-luxury">sebelum datang</span>
        </h2>
      </div>
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FRAMES.map((f, i) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-card/60 p-6 transition hover:-translate-y-2 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
          >
            {/* Frame preview art */}
            <div
              className="mb-5 h-48 overflow-hidden rounded-2xl flex flex-col"
              style={{
                background: `linear-gradient(145deg, ${f.secondaryColor}20, ${f.primaryColor}15)`,
                border: `2px solid ${f.primaryColor}30`,
              }}
            >
              <div className="flex-1 flex items-center justify-center">
                <span className="text-6xl">{f.emoji}</span>
              </div>
              <div
                className="px-3 py-2 text-center text-xs font-bold"
                style={{ backgroundColor: f.primaryColor, color: f.secondaryColor }}
              >
                {f.name}
              </div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold">{f.name}</h3>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                {f.badge}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">{f.description}</p>
            <Link
              to="/frame"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold transition hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
            >
              Pilih Frame <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function AwsSection() {
  const items = [
    { icon: Server, t: "EC2 Virtual Server", d: "Aplikasi berjalan pada instance EC2 sebagai compute layer utama." },
    { icon: ShieldCheck, t: "Security Group", d: "Akses masuk & keluar diatur ketat sesuai kebutuhan aplikasi." },
    { icon: Network, t: "VPC & Subnet", d: "Isolasi jaringan untuk pemisahan public dan private tier." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-8 sm:p-12">
        <div className="pointer-events-none absolute -top-32 -right-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">About the System</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
              Siap dideploy di{" "}
              <span className="font-display italic text-gradient-luxury">infrastruktur IaaS</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Sistem ini dirancang untuk dideploy pada infrastruktur AWS IaaS menggunakan EC2 sebagai virtual server. Website dapat dikembangkan dengan database, load balancer, autoscaling, dan security group untuk mendukung scalability, availability, dan keamanan akses.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {items.map((i) => (
              <div key={i.t} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-primary/40">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary/25 to-accent/25 text-primary">
                  <i.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold">{i.t}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{i.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div
        className="relative overflow-hidden rounded-[2.5rem] border border-white/15 p-10 text-center sm:p-16"
        style={{ background: "var(--gradient-mesh), radial-gradient(ellipse at center, oklch(0.2 0.06 240), oklch(0.08 0.015 240))" }}
      >
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
        <div className="relative">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
            <Camera className="h-3.5 w-3.5" /> Lights. Camera. Booking.
          </div>
          <h2 className="mt-6 text-4xl font-bold leading-tight sm:text-6xl">
            Siap menyewa studio dan{" "}
            <span className="font-display italic text-gradient-luxury">mengabadikan momen</span>?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
            Booking studio photobooth sekarang dan nikmati pengalaman foto premium bersama SnapBooth Studio. Frame estetik, studio tematik, booking mudah.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/booking"
              className="btn-glow inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-7 py-3.5 text-sm font-semibold text-primary-foreground"
            >
              Booking Studio <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/kamera"
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-6 py-3.5 text-sm font-semibold text-primary backdrop-blur hover:bg-primary/20"
            >
              <Sparkles className="h-4 w-4" /> Coba Kamera
            </Link>
            <Link
              to="/galeri"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold backdrop-blur hover:border-primary/50 hover:bg-white/10"
            >
              Lihat Galeri
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
