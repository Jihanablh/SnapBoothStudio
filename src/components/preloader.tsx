import { useEffect, useState } from "react";
import { Camera, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Preloader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Apply initial theme on mount
    const saved = localStorage.getItem("snapbooth.theme");
    const html = document.documentElement;
    if (saved === "light") {
      html.classList.add("light");
      html.classList.remove("dark");
    } else {
      html.classList.add("dark");
      html.classList.remove("light");
    }

    const start = Date.now();
    const duration = 1800;
    let raf: number;
    function tick() {
      const elapsed = Date.now() - start;
      const p = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(p);
      if (p < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setLeaving(true);
          setTimeout(onDone, 500);
        }, 200);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <AnimatePresence>
      {!leaving ? (
        <motion.div
          key="preloader"
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 50%, oklch(0.2 0.08 240 / 0.5), var(--background))",
          }}
        >
          {/* Animated background rings */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {[200, 300, 400].map((s, i) => (
              <div
                key={i}
                className="absolute rounded-full border border-primary/10"
                style={{
                  width: s,
                  height: s,
                  animation: `pulse-ring ${2 + i * 0.5}s ease-out ${i * 0.3}s infinite`,
                }}
              />
            ))}
          </div>

          {/* Logo */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative mb-8 flex flex-col items-center gap-4"
          >
            <div className="relative grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-primary to-accent shadow-[0_0_60px_oklch(0.6_0.22_240/0.6)]">
              <Camera className="h-10 w-10 text-primary-foreground" />
              <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-primary" />
            </div>

            <div className="text-center">
              <h1 className="text-3xl font-black tracking-tight">
                SnapBooth{" "}
                <span className="font-display italic text-gradient-blue">
                  Studio
                </span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Studio Photobooth Rental
              </p>
            </div>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-48"
          >
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Memuat...
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
