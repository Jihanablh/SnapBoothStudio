import { Link } from "@tanstack/react-router";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Camera, Sparkles, Star, Video } from "lucide-react";
import { useEffect, useRef } from "react";
import { MagneticButton } from "./magnetic-button";

const POLAROIDS = [
  {
    label: "Blue Moment",
    emoji: "💙",
    bgClass: "from-blue-900 to-slate-800",
    rot: -8,
    x: "-2%",
    y: "6%",
    d: 0,
  },
  {
    label: "Vintage Red Phone",
    emoji: "📞",
    bgClass: "from-red-900 to-stone-800",
    rot: 6,
    x: "62%",
    y: "-4%",
    d: 0.15,
  },
  {
    label: "Pixie Cinema",
    emoji: "🎬",
    bgClass: "from-stone-800 to-amber-900",
    rot: -4,
    x: "58%",
    y: "52%",
    d: 0.3,
  },
  {
    label: "Newspaper Classic",
    emoji: "📰",
    bgClass: "from-neutral-800 to-zinc-900",
    rot: 9,
    x: "-6%",
    y: "50%",
    d: 0.45,
  },
];

export function HeroScene() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const glowX = useTransform(sx, (v) => `${v * 100}%`);
  const glowY = useTransform(sy, (v) => `${v * 100}%`);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      mx.set((e.clientX - r.left) / r.width);
      my.set((e.clientY - r.top) / r.height);
    };
    el.addEventListener("mousemove", move);
    return () => el.removeEventListener("mousemove", move);
  }, [mx, my]);

  return (
    <section ref={wrapRef} className="relative isolate overflow-hidden">
      {/* Mesh gradient backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "var(--gradient-mesh)" }} />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-60" />
      {/* Mouse-tracked spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          background: useTransform([glowX, glowY], ([x, y]) =>
            `radial-gradient(600px circle at ${x} ${y}, oklch(0.6 0.22 240 / 0.2), transparent 60%)`
          ) as unknown as string,
        }}
      />
      {/* Camera flash */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-white/60 mix-blend-overlay animate-camera-flash" />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 pt-16 pb-24 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:pt-24 lg:pb-32">
        {/* LEFT — text */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-primary" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Studio Photobooth Rental & Self Photo Experience
          </motion.span>

          <motion.h1
            initial="hidden" animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
            className="mt-6 text-[clamp(2.6rem,7vw,5.8rem)] font-black leading-[0.98] tracking-tight"
          >
            {["Book Your", "Studio."].map((w, i) => (
              <motion.span key={i} variants={wordVar} className="mr-3 inline-block">{w}</motion.span>
            ))}
            <br />
            <motion.span variants={wordVar} className="font-display italic text-gradient-blue">
              Capture
            </motion.span>{" "}
            <motion.span variants={wordVar} className="font-display italic">
              Your
            </motion.span>{" "}
            <motion.span variants={wordVar} className="font-display italic text-gradient-neon">
              Moment.
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.6 }}
            className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Sewa studio photobooth dengan tema unik, frame estetik, dan pengalaman foto langsung yang mudah dipesan secara online. Booking slot dalam hitungan menit.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <MagneticButton as={Link} to="/booking" className="btn-glow group relative overflow-hidden rounded-full bg-gradient-to-r from-primary to-accent px-7 py-4 text-sm font-semibold text-primary-foreground">
              <span className="relative z-10 inline-flex items-center gap-2">
                Booking Studio <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="pointer-events-none absolute inset-0 -z-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine" />
            </MagneticButton>
            <MagneticButton as={Link} to="/kamera" className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-6 py-4 text-sm font-semibold text-primary backdrop-blur transition hover:bg-primary/20">
              <Video className="h-4 w-4" /> Coba Kamera
            </MagneticButton>
            <MagneticButton as={Link} to="/frame" className="rounded-full border border-white/15 bg-white/5 px-6 py-4 text-sm font-semibold backdrop-blur transition hover:border-primary/40 hover:bg-white/10">
              Lihat Frame
            </MagneticButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-6"
          >
            {[
              { n: "4", l: "Studio Tema" },
              { n: "4.9", l: "Rating Studio", star: true },
              { n: "100%", l: "Booking Online" },
            ].map((s) => (
              <div key={s.l}>
                <div className="flex items-baseline gap-1 text-3xl font-bold text-gradient-blue">
                  {s.n}{s.star && <Star className="h-4 w-4 fill-primary text-primary" />}
                </div>
                <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT — studio polaroid stack */}
        <div className="relative min-h-[520px] lg:min-h-[560px]">
          <div className="absolute inset-0" style={{ perspective: "1400px" }}>
            {POLAROIDS.map((p, i) => (
              <motion.figure
                key={i}
                initial={{ opacity: 0, y: 30, rotate: p.rot - 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, rotate: p.rot, scale: 1 }}
                transition={{ delay: 0.4 + p.d, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
                whileHover={{ scale: 1.06, rotate: p.rot / 2, zIndex: 40, transition: { duration: 0.35 } }}
                className="absolute w-[46%] max-w-[240px] rounded-[18px] bg-white p-2.5 pb-10 shadow-2xl shadow-black/60 will-change-transform animate-float-slow"
                style={{ left: p.x, top: p.y, ["--rot" as string]: `${p.rot}deg` }}
              >
                <div className={`relative aspect-[4/5] overflow-hidden rounded-md bg-gradient-to-br ${p.bgClass} flex items-center justify-center`}>
                  <div className="text-center">
                    <div className="text-5xl">{p.emoji}</div>
                    <div className="mt-3 text-xs font-semibold text-white/80">{p.label}</div>
                    <div className="mt-1 text-[10px] text-white/50">Studio</div>
                  </div>
                  {/* Camera flash overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <figcaption className="absolute inset-x-0 bottom-2 text-center font-display text-[13px] italic text-neutral-800">
                  {p.label}
                </figcaption>
              </motion.figure>
            ))}
          </div>

          {/* Floating booking confirmation card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.7 }}
            className="absolute -bottom-2 left-1/2 z-30 w-[280px] -translate-x-1/2 rounded-2xl border border-primary/20 glass-strong p-4 shadow-2xl shadow-black/50"
          >
            <div className="flex items-center gap-3">
              <div className="relative grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent">
                <Camera className="h-5 w-5 text-white" />
                <span className="absolute -right-1 -top-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-primary" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-sm font-semibold">
                  Studio dikonfirmasi <Sparkles className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="truncate text-xs text-muted-foreground">Blue Moment · 15.00 · Studio Hour</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
        className="pointer-events-none absolute inset-x-0 bottom-4 flex flex-col items-center gap-1.5 text-[10px] uppercase tracking-[0.35em] text-muted-foreground"
      >
        Scroll
        <div className="h-8 w-px animate-pulse bg-gradient-to-b from-primary to-transparent" />
      </motion.div>
    </section>
  );
}

const wordVar = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number],
    },
  },
};
