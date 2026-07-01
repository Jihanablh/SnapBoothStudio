import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Camera, PartyPopper, ArrowRight } from "lucide-react";
import { useEffect, useMemo } from "react";

export function BookingSuccessModal({ open, bookingId, onClose, onAnother }: {
  open: boolean; bookingId?: string; onClose: () => void; onAnother: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const confetti = useMemo(
    () => Array.from({ length: 42 }).map(() => ({
      x: (Math.random() - 0.5) * 520,
      y: -140 - Math.random() * 260,
      r: Math.random() * 540,
      c: ["#ffb27a", "#c084fc", "#60a5fa", "#f472b6", "#facc15", "#34d399"][Math.floor(Math.random() * 6)],
      d: Math.random() * 0.4,
    })), []
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] grid place-items-center bg-black/70 backdrop-blur-md p-4"
          onClick={onClose}
        >
          {/* Confetti */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden">
            {confetti.map((c, i) => (
              <motion.span
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                animate={{ x: c.x, y: c.y, opacity: 0, rotate: c.r }}
                transition={{ duration: 1.6, delay: c.d, ease: [0.2, 0.8, 0.2, 1] }}
                className="absolute h-2 w-3 rounded-sm"
                style={{ background: c.c }}
              />
            ))}
          </div>

          {/* Camera flash */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: [0, 0.85, 0] }} transition={{ duration: 0.6 }}
            className="pointer-events-none absolute inset-0 bg-white"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-card via-card to-card/70 p-8 text-center shadow-2xl shadow-primary/30"
          >
            <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
            <div className="relative">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/40">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <h3 className="mt-6 text-2xl font-bold">
                Booking berhasil dibuat <PartyPopper className="inline h-6 w-6 text-primary" />
              </h3>
              {bookingId && (
                <p className="mt-2 font-mono text-sm text-primary">ID: {bookingId}</p>
              )}
              <p className="mt-3 text-sm text-muted-foreground">
                Data pemesanan telah masuk ke dashboard admin. Kami akan segera mengonfirmasi jadwalmu.
              </p>
              <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Link to="/admin" className="btn-glow inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-3 text-sm font-semibold text-primary-foreground">
                  Lihat Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
                <button onClick={onAnother} className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold hover:border-primary/40 hover:bg-white/10">
                  Tambah Booking Lagi
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
