import { motion } from "framer-motion";
import { PackageOpen, CalendarCheck, UserPen, ShieldCheck } from "lucide-react";

const STEPS = [
  { n: "01", icon: PackageOpen, t: "Pilih Studio & Frame", d: "Pilih studio tema favoritmu dan frame photobooth yang kamu inginkan." },
  { n: "02", icon: CalendarCheck, t: "Tentukan Jadwal & Durasi", d: "Pilih tanggal, jam, dan durasi sewa. Slot tersedia real-time." },
  { n: "03", icon: UserPen, t: "Isi Data & Konfirmasi", d: "Isi data pelanggan dan pilih paket. Total harga terhitung otomatis." },
  { n: "04", icon: ShieldCheck, t: "Admin Konfirmasi Booking", d: "Status booking & pembayaran terpantau langsung dari dashboard admin." },
];

export function HowItWorks() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">How It Works</p>
        <h2 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
          Empat langkah <span className="font-display italic text-gradient-neon">tanpa drama</span>.
        </h2>
        <p className="mt-4 text-muted-foreground">Alur booking dirancang secepat dan sejelas platform reservasi kelas dunia.</p>
      </div>

      <div className="relative mt-14">
        <div className="pointer-events-none absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent md:block" />
        <div className="grid gap-6 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition hover:border-primary/40 hover:bg-white/[0.06]"
            >
              <div className="flex items-center justify-between">
                <span className="relative grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02] text-primary shadow-inner">
                  <s.icon className="h-7 w-7 transition-transform group-hover:scale-110" />
                  <span className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-br from-primary/40 to-accent/30 opacity-0 blur-md transition group-hover:opacity-100" />
                </span>
                <span className="font-display text-4xl italic text-white/15 transition group-hover:text-primary/60">{s.n}</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
