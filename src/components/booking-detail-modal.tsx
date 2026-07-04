import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatIDR } from "@/lib/packages";
import { PaymentBadge, StatusBadge } from "./status-badge";
import type { ApiBooking } from "@/services/api";
import { Calendar, Clock, Users, Package, LayoutGrid, ImageIcon, CreditCard, MessageSquare } from "lucide-react";

interface BookingDetailModalProps {
  booking: ApiBooking | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function BookingDetailModal({ booking, open, onOpenChange }: BookingDetailModalProps) {
  if (!booking) return null;

  let addonsList = "";
  try { addonsList = (JSON.parse(booking.addons) as string[]).join(", ") || "Tidak ada"; }
  catch { addonsList = booking.addons || "Tidak ada"; }

  const rows: { icon: typeof Calendar; label: string; value: string }[] = [
    { icon: Calendar,    label: "Tanggal Booking", value: booking.booking_date },
    { icon: Clock,       label: "Jam Booking",      value: `${booking.start_time} (${booking.duration_minutes} menit)` },
    { icon: Users,       label: "Jumlah Orang",     value: `${booking.people_count} orang` },
    { icon: LayoutGrid,  label: "Studio",            value: booking.studio_name ?? "-" },
    { icon: ImageIcon,   label: "Frame",             value: booking.frame_name ?? "-" },
    { icon: Package,     label: "Paket",             value: booking.package_name ?? "-" },
    { icon: CreditCard,  label: "Total Harga",       value: formatIDR(booking.total_price) },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Detail Booking
            <span className="rounded-full bg-primary/10 px-3 py-0.5 font-mono text-xs text-primary">{booking.booking_code}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer */}
          <div className="rounded-2xl border border-border bg-background/40 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Pelanggan</p>
            <p className="mt-1 text-lg font-bold">{booking.customer_name}</p>
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
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background/30 px-4 py-2.5">
              <Package className="h-4 w-4 shrink-0 text-primary" />
              <span className="min-w-[120px] text-xs text-muted-foreground">Add-on</span>
              <span className="text-sm font-medium">{addonsList}</span>
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={booking.booking_status} />
            <PaymentBadge status={booking.payment_status} />
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
