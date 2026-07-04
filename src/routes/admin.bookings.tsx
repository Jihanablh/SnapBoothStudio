import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import {
  Search, Filter, Edit2, Trash2, CheckCircle2, RefreshCw, AlertCircle, Eye,
} from "lucide-react";
import { toast } from "sonner";
import {
  apiGetBookings, apiUpdateBookingStatus, apiDeleteBooking, apiUpdateBooking,
  type ApiBooking, type BookingFilters,
} from "@/services/api";
import { formatIDR } from "@/lib/packages";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/bookings")({
  component: BookingsPage,
  head: () => ({ meta: [{ title: "Data Booking — Admin SnapBooth" }] }),
});

const STATUS_OPTS = ["", "Pending", "Confirmed", "Completed", "Cancelled"];
const PAYMENT_OPTS = ["", "Belum Bayar", "DP", "Lunas"];

const statusColor: Record<string, string> = {
  Pending:   "bg-yellow-400/15 text-yellow-300 border-yellow-400/30",
  Confirmed: "bg-blue-400/15  text-blue-300  border-blue-400/30",
  Completed: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  Cancelled: "bg-red-400/15   text-red-300   border-red-400/30",
};
const payColor: Record<string, string> = {
  "Belum Bayar": "bg-red-400/15 text-red-300 border-red-400/30",
  DP:            "bg-amber-400/15 text-amber-300 border-amber-400/30",
  Lunas:         "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
};

function BookingsPage() {
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<BookingFilters>({});
  const [search, setSearch] = useState("");

  // Edit modal state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editPayment, setEditPayment] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Detail modal
  const [detailBooking, setDetailBooking] = useState<ApiBooking | null>(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await apiGetBookings({ ...filters, search: search || undefined });
    if (res.success && res.data) {
      setBookings(res.data);
    } else {
      setError(res.message || "Gagal mengambil data booking.");
    }
    setLoading(false);
  }, [filters, search]);

  useEffect(() => { void loadBookings(); }, [loadBookings]);

  async function handleUpdateStatus(b: ApiBooking) {
    setEditingId(b.id);
    setEditStatus(b.booking_status);
    setEditPayment(b.payment_status);
    setEditNotes(b.notes ?? "");
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);
    const res = await apiUpdateBooking(editingId, {
      booking_status: editStatus,
      payment_status: editPayment,
      notes: editNotes,
    });
    setSaving(false);
    if (res.success) {
      toast.success("Booking berhasil diperbarui.");
      setEditingId(null);
      void loadBookings();
    } else {
      toast.error(res.message || "Gagal memperbarui booking.");
    }
  }

  async function handleDelete(b: ApiBooking) {
    if (!confirm(`Hapus booking ${b.booking_code} atas nama ${b.customer_name}?\n\nTindakan ini tidak bisa dibatalkan.`)) return;
    const res = await apiDeleteBooking(b.id);
    if (res.success) {
      toast.success(`Booking ${b.booking_code} berhasil dihapus.`);
      void loadBookings();
    } else {
      toast.error(res.message || "Gagal menghapus booking.");
    }
  }

  const inputCls = "rounded-xl border border-border bg-input/50 px-3 py-2 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/15";

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Manajemen</p>
        <h1 className="mt-1 text-2xl font-bold">Data Booking</h1>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-2xl border border-border bg-card/60 p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Cari nama, WA, kode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputCls + " pl-9 w-full"}
          />
        </div>
        <select value={filters.status ?? ""} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined }))} className={inputCls}>
          {STATUS_OPTS.map((s) => <option key={s} value={s}>{s || "Semua Status"}</option>)}
        </select>
        <select value={filters.payment_status ?? ""} onChange={(e) => setFilters((f) => ({ ...f, payment_status: e.target.value || undefined }))} className={inputCls}>
          {PAYMENT_OPTS.map((s) => <option key={s} value={s}>{s || "Semua Pembayaran"}</option>)}
        </select>
        <button onClick={loadBookings} className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm hover:border-primary/40 transition">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-card/60">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {["Kode", "Pelanggan", "Studio", "Paket", "Tanggal", "Total", "Status", "Pembayaran", "Aksi"].map((h) => (
                <th key={h} className="px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border/40">
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 animate-pulse rounded bg-border" />
                    </td>
                  ))}
                </tr>
              ))
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-muted-foreground">
                  {error ? "Tidak bisa mengambil data." : "Belum ada data booking."}
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="border-b border-border/40 hover:bg-primary/5 transition">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-primary">{b.booking_code}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{b.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{b.whatsapp}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">{b.studio_name ?? "-"}</td>
                  <td className="px-4 py-3 text-xs">{b.package_name ?? "-"}</td>
                  <td className="px-4 py-3 text-xs">
                    {b.booking_date}<br />
                    <span className="text-muted-foreground">{b.start_time}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatIDR(b.total_price)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-bold", statusColor[b.booking_status])}>
                      {b.booking_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-bold", payColor[b.payment_status])}>
                      {b.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setDetailBooking(b)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition"
                        title="Detail"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(b)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => void handleDelete(b)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">{bookings.length} data ditemukan</p>

      {/* Edit Modal */}
      {editingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-2xl">
            <h3 className="text-lg font-bold mb-5">Edit Booking</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status Booking</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className={inputCls + " w-full"}>
                  {STATUS_OPTS.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status Pembayaran</label>
                <select value={editPayment} onChange={(e) => setEditPayment(e.target.value)} className={inputCls + " w-full"}>
                  {PAYMENT_OPTS.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Catatan</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className={inputCls + " w-full"}
                  placeholder="Catatan tambahan..."
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => void saveEdit()}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <CheckCircle2 className="h-4 w-4" />}
                Simpan
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="rounded-full border border-border px-5 py-3 text-sm font-medium hover:border-primary/40 transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold">Detail Booking</h3>
                <p className="text-xs font-mono text-primary mt-1">{detailBooking.booking_code}</p>
              </div>
              <button onClick={() => setDetailBooking(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <dl className="space-y-3 text-sm">
              {[
                ["Nama", detailBooking.customer_name],
                ["WhatsApp", detailBooking.whatsapp],
                ["Email", detailBooking.email || "-"],
                ["Studio", detailBooking.studio_name || "-"],
                ["Paket", detailBooking.package_name || "-"],
                ["Frame", detailBooking.frame_name || "-"],
                ["Tanggal", detailBooking.booking_date],
                ["Jam", detailBooking.start_time],
                ["Durasi", `${detailBooking.duration_minutes} menit`],
                ["Jumlah Orang", String(detailBooking.people_count)],
                ["Add-on", (() => { try { return JSON.parse(detailBooking.addons).join(", ") || "-"; } catch { return "-"; } })()],
                ["Total", formatIDR(detailBooking.total_price)],
                ["Status", detailBooking.booking_status],
                ["Pembayaran", detailBooking.payment_status],
                ["Catatan", detailBooking.notes || "-"],
                ["Dibuat", new Date(detailBooking.created_at).toLocaleString("id-ID")],
              ].map(([l, v]) => (
                <div key={l} className="flex gap-4">
                  <dt className="w-28 shrink-0 text-muted-foreground">{l}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
