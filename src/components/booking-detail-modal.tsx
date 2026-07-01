import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getFrame, getStudio, formatIDR } from "@/lib/packages";
import { PaymentBadge, StatusBadge } from "./status-badge";
import type { Booking } from "@/lib/bookings-store";
import { Calendar, Clock, Users, Package, LayoutGrid, ImageIcon, CreditCard, MessageSquare } from "lucide-react";

interface BookingDetailModalProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function BookingDetailModal({ booking, open, onOpenChange }: BookingDetailModalProps) {
  if (!booking) return null;
  const studio = getStudio(booking.studioId);
  const frame = getFrame(booking.frameId);

  const rows: { icon: typeof Calendar; label: string; value: string }[] = [
    { icon: Calendar, label: "Tanggal Booking", value: booking.bookingDate },
    { icon: Clock, label: "Jam Booking", value: `${booking.timeSlot} (${booking.duration === "30min" ? "30 menit" : booking.duration === "1h" ? "1 jam" : "2 jam"})` },
    { icon: Users, label: "Jumlah Orang", value: `${booking.guestCount} orang` },
    { icon: LayoutGrid, label: "Studio", value: `${studio.emoji} ${studio.name}` },
    { icon: ImageIcon, label: "Frame", value: `${frame.emoji} ${frame.name}` },
    { icon: Package, label: "Paket", value: booking.packageId === "quick-shot" ? "Quick Shot" : booking.packageId === "studio-hour" ? "Studio Hour" : "Full Experience" },
    { icon: CreditCard, label: "Total Harga", value: formatIDR(booking.totalPrice) },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Detail Booking
            <span className="rounded-full bg-primary/10 px-3 py-0.5 font-mono text-xs text-primary">{booking.id}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer */}
          <div className="rounded-2xl border border-border bg-background/40 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Pelanggan</p>
            <p className="mt-1 text-lg font-bold">{booking.customerName}</p>
            <p className="text-sm text-muted-foreground">{booking.whatsapp}</p>
            {booking.email && <p className="text-sm text-muted-foreground">{booking.email}</p>}
          </div>

          {/* Details grid */}
          <div className="grid gap-2">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center gap-3 rounded-xl border border-border bg-background/30 px-4 py-2.5">
                <r.icon className="h-4 w-4 shrink-0 text-primary" />
                <span className="min-w-[120px] text-xs text-muted-foreground">{r.label}</span>
                <span className="text-sm font-medium">{r.value}</span>
              </div>
            ))}
          </div>

          {/* Status */}
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={booking.status} />
            <PaymentBadge status={booking.paymentStatus} />
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="flex gap-2 rounded-xl border border-border bg-background/30 px-4 py-3">
              <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{booking.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
