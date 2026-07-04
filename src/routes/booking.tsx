import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BookingForm } from "@/components/booking-form";
import { BookingSuccessModal } from "@/components/booking-success-modal";

export const Route = createFileRoute("/booking")({
  component: BookingPage,
  head: () => ({
    meta: [
      { title: "Booking Studio — SnapBooth Studio" },
      { name: "description", content: "Booking slot studio photobooth dengan mudah. Pilih studio, frame, jadwal, dan durasi sewa hanya dalam beberapa langkah." },
      { property: "og:title", content: "Booking Studio — SnapBooth Studio" },
    ],
  }),
});

function BookingPage() {
  const [successId, setSuccessId] = useState<string | undefined>(undefined);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 pt-14 pb-8 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Reservasi Studio</p>
        <h1 className="mt-3 text-4xl font-bold sm:text-6xl">
          Booking <span className="font-display italic text-gradient-blue">Studio</span>
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Pilih studio, frame, tanggal, dan durasi sewa. Total harga terhitung otomatis. Booking selesai dalam menit.
        </p>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <BookingForm
          onSuccess={(id) => setSuccessId(id)}
        />
      </section>
      <BookingSuccessModal
        open={!!successId}
        bookingId={successId}
        onClose={() => setSuccessId(undefined)}
        onAnother={() => setSuccessId(undefined)}
      />
      <SiteFooter />
    </div>
  );
}
