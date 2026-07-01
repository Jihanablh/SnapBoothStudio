import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Eye, Pencil, Search, Trash2, Users } from "lucide-react";
import {
  bookingsStore,
  useBookings,
  type Booking,
  type BookingStatus,
  type PaymentStatus,
} from "@/lib/bookings-store";
import {
  FRAMES,
  PACKAGES,
  STUDIOS,
  formatIDR,
  getFrame,
  getPackage,
  getStudio,
  type FrameId,
  type PackageId,
  type StudioId,
  type Duration,
} from "@/lib/packages";
import { PaymentBadge, StatusBadge } from "@/components/status-badge";
import { BookingDetailModal } from "@/components/booking-detail-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/bookings")({
  component: BookingsPage,
});

const STATUS: BookingStatus[] = ["Pending", "Confirmed", "Completed", "Cancelled"];
const PAY: PaymentStatus[] = ["Belum Bayar", "DP", "Lunas"];

function BookingsPage() {
  const bookings = useBookings();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [pay, setPay] = useState<string>("all");
  const [studio, setStudio] = useState<string>("all");
  const [frame, setFrame] = useState<string>("all");
  const [sortAsc, setSortAsc] = useState(true);
  const [detail, setDetail] = useState<Booking | null>(null);
  const [edit, setEdit] = useState<Booking | null>(null);
  const [del, setDel] = useState<Booking | null>(null);

  const filtered = useMemo(() => {
    let list = [...bookings];
    if (q) {
      const t = q.toLowerCase();
      list = list.filter(
        (b) =>
          b.customerName.toLowerCase().includes(t) ||
          b.id.toLowerCase().includes(t) ||
          b.whatsapp.includes(t),
      );
    }
    if (status !== "all") list = list.filter((b) => b.status === status);
    if (pay !== "all") list = list.filter((b) => b.paymentStatus === pay);
    if (studio !== "all") list = list.filter((b) => b.studioId === studio);
    if (frame !== "all") list = list.filter((b) => b.frameId === frame);
    list.sort((a, b) =>
      sortAsc
        ? a.bookingDate.localeCompare(b.bookingDate)
        : b.bookingDate.localeCompare(a.bookingDate),
    );
    return list;
  }, [bookings, q, status, pay, studio, frame, sortAsc]);

  const selectCls =
    "rounded-xl border border-border bg-input/50 px-3 py-2 text-sm outline-none focus:border-primary/60";

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Manajemen</p>
        <h1 className="mt-1 text-3xl font-bold">Data Booking Studio</h1>
      </header>

      <div className="rounded-3xl border border-border bg-card/60 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama, ID, atau WhatsApp..."
              className="w-full rounded-xl border border-border bg-input/50 pl-10 pr-3 py-2 text-sm outline-none focus:border-primary/60"
            />
          </div>
          <select className={selectCls} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Semua Status</option>
            {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className={selectCls} value={pay} onChange={(e) => setPay(e.target.value)}>
            <option value="all">Semua Pembayaran</option>
            {PAY.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className={selectCls} value={studio} onChange={(e) => setStudio(e.target.value)}>
            <option value="all">Semua Studio</option>
            {STUDIOS.map((s) => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
          </select>
          <select className={selectCls} value={frame} onChange={(e) => setFrame(e.target.value)}>
            <option value="all">Semua Frame</option>
            {FRAMES.map((f) => <option key={f.id} value={f.id}>{f.emoji} {f.name}</option>)}
          </select>
          <button
            onClick={() => setSortAsc((v) => !v)}
            className={selectCls + " hover:border-primary/40"}
          >
            Tanggal {sortAsc ? "↑" : "↓"}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card/60">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                {[
                  "ID",
                  "Pelanggan",
                  "WhatsApp",
                  "Studio",
                  "Frame",
                  "Tanggal",
                  "Jam",
                  "Durasi",
                  "Tamu",
                  "Paket",
                  "Total",
                  "Status",
                  "Pembayaran",
                  "Aksi",
                ].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={14} className="px-4 py-16 text-center text-muted-foreground">
                    Tidak ada data booking.
                  </td>
                </tr>
              )}
              {filtered.map((b) => {
                const studio = getStudio(b.studioId);
                const frame = getFrame(b.frameId);
                const durLabel = b.duration === "30min" ? "30 mnt" : b.duration === "1h" ? "1 jam" : "2 jam";
                return (
                  <tr key={b.id} className="transition hover:bg-secondary/40">
                    <td className="px-4 py-3 font-mono text-xs">{b.id}</td>
                    <td className="px-4 py-3 font-medium">{b.customerName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.whatsapp}</td>
                    <td className="px-4 py-3 text-xs">
                      <span title={studio.name}>{studio.emoji} {studio.name.split(" ")[0]}</span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span title={frame.name}>{frame.emoji} {frame.name.split(" ")[0]}</span>
                    </td>
                    <td className="px-4 py-3">{b.bookingDate}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{b.timeSlot}</td>
                    <td className="px-4 py-3 text-xs">{durLabel}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {b.guestCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getPackage(b.packageId).name}</td>
                    <td className="px-4 py-3 font-semibold">{formatIDR(b.totalPrice)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3">
                      <PaymentBadge status={b.paymentStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <IconBtn title="Detail" onClick={() => setDetail(b)}>
                          <Eye className="h-4 w-4" />
                        </IconBtn>
                        <IconBtn title="Edit" onClick={() => setEdit(b)}>
                          <Pencil className="h-4 w-4" />
                        </IconBtn>
                        <IconBtn title="Hapus" danger onClick={() => setDel(b)}>
                          <Trash2 className="h-4 w-4" />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <BookingDetailModal
        booking={detail}
        open={!!detail}
        onOpenChange={(v) => !v && setDetail(null)}
      />
      <EditModal booking={edit} onClose={() => setEdit(null)} />
      <AlertDialog open={!!del} onOpenChange={(v) => !v && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Booking {del?.id} atas nama <b>{del?.customerName}</b> akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (del) {
                  bookingsStore.remove(del.id);
                  toast.success(`Booking ${del.id} dihapus`);
                  setDel(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function IconBtn({
  children,
  danger,
  title,
  onClick,
}: {
  children: React.ReactNode;
  danger?: boolean;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`grid h-8 w-8 place-items-center rounded-lg border border-border transition hover:-translate-y-0.5 ${
        danger
          ? "hover:border-destructive/60 hover:bg-destructive/10 hover:text-destructive"
          : "hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function EditModal({
  booking,
  onClose,
}: {
  booking: Booking | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Booking | null>(booking);
  if (booking && (!form || form.id !== booking.id)) setForm(booking);
  if (!booking || !form) return null;

  const inputCls =
    "w-full rounded-xl border border-border bg-input/50 px-3 py-2 text-sm outline-none focus:border-primary/60";

  function save() {
    if (!form) return;
    bookingsStore.update(form.id, {
      customerName: form.customerName,
      whatsapp: form.whatsapp,
      email: form.email,
      studioId: form.studioId,
      frameId: form.frameId,
      bookingDate: form.bookingDate,
      timeSlot: form.timeSlot,
      duration: form.duration,
      guestCount: form.guestCount,
      packageId: form.packageId,
      status: form.status,
      paymentStatus: form.paymentStatus,
      notes: form.notes,
    });
    toast.success(`Booking ${form.id} diperbarui`);
    onClose();
  }

  return (
    <Dialog open={!!booking} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl border-border bg-card">
        <DialogHeader>
          <DialogTitle>Edit Booking · {form.id}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <L label="Nama">
            <input className={inputCls} value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
          </L>
          <L label="WhatsApp">
            <input className={inputCls} value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
          </L>
          <L label="Studio">
            <select className={inputCls} value={form.studioId} onChange={(e) => setForm({ ...form, studioId: e.target.value as StudioId })}>
              {STUDIOS.map((s) => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
            </select>
          </L>
          <L label="Frame">
            <select className={inputCls} value={form.frameId} onChange={(e) => setForm({ ...form, frameId: e.target.value as FrameId })}>
              {FRAMES.map((f) => <option key={f.id} value={f.id}>{f.emoji} {f.name}</option>)}
            </select>
          </L>
          <L label="Tanggal">
            <input type="date" className={inputCls} value={form.bookingDate} onChange={(e) => setForm({ ...form, bookingDate: e.target.value })} />
          </L>
          <L label="Jam">
            <input className={inputCls} value={form.timeSlot} onChange={(e) => setForm({ ...form, timeSlot: e.target.value })} />
          </L>
          <L label="Durasi">
            <select className={inputCls} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value as Duration })}>
              <option value="30min">30 menit</option>
              <option value="1h">1 jam</option>
              <option value="2h">2 jam</option>
            </select>
          </L>
          <L label="Jumlah Tamu">
            <input type="number" min={1} max={6} className={inputCls} value={form.guestCount} onChange={(e) => setForm({ ...form, guestCount: Number(e.target.value) })} />
          </L>
          <L label="Paket">
            <select className={inputCls} value={form.packageId} onChange={(e) => setForm({ ...form, packageId: e.target.value as PackageId })}>
              {PACKAGES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </L>
          <L label="Status">
            <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as BookingStatus })}>
              {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </L>
          <L label="Pembayaran">
            <select className={inputCls} value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value as PaymentStatus })}>
              {PAY.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </L>
          <L label="Catatan" className="sm:col-span-2">
            <textarea rows={2} className={inputCls} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </L>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm">
            Batal
          </button>
          <button onClick={save} className="rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30">
            Simpan
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function L({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={"block " + className}>
      <span className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
