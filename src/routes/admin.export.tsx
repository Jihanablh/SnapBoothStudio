import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { bookingsStore, useBookings, type Booking } from "@/lib/bookings-store";
import { ADDONS, getPackage, getStudio, getFrame } from "@/lib/packages";

export const Route = createFileRoute("/admin/export")({
  component: ExportPage,
});

const COLUMNS = [
  "ID Booking",
  "Nama Pelanggan",
  "Nomor WhatsApp",
  "Email",
  "Studio",
  "Frame",
  "Tanggal Booking",
  "Jam Booking",
  "Durasi",
  "Jumlah Orang",
  "Paket",
  "Add-on",
  "Total Harga",
  "Status Booking",
  "Status Pembayaran",
  "Catatan",
];

function toRow(b: Booking) {
  const addonNames = ADDONS.filter((a) => b.addons.includes(a.id))
    .map((a) => a.name)
    .join(", ");
  const durLabel = b.duration === "30min" ? "30 menit" : b.duration === "1h" ? "1 jam" : "2 jam";
  return [
    b.id,
    b.customerName,
    b.whatsapp,
    b.email,
    getStudio(b.studioId).name,
    getFrame(b.frameId).name,
    b.bookingDate,
    b.timeSlot,
    durLabel,
    b.guestCount,
    getPackage(b.packageId).name,
    addonNames,
    b.totalPrice,
    b.status,
    b.paymentStatus,
    b.notes,
  ];
}

function ExportPage() {
  const bookings = useBookings();

  function downloadCSV() {
    const rows = [COLUMNS, ...bookings.map(toRow)];
    const csv = rows
      .map((r) =>
        r
          .map((c) => {
            const s = String(c ?? "");
            return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(","),
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    triggerDownload(blob, `snapbooth-bookings-${Date.now()}.csv`);
    bookingsStore.logExport();
    toast.success("Data booking berhasil diexport ke spreadsheet.", {
      description: "File CSV telah diunduh.",
    });
  }

  function downloadXLSX() {
    const ws = XLSX.utils.aoa_to_sheet([COLUMNS, ...bookings.map(toRow)]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    XLSX.writeFile(wb, `snapbooth-bookings-${Date.now()}.xlsx`);
    bookingsStore.logExport();
    toast.success("Data booking berhasil diexport ke spreadsheet.", {
      description: "File XLSX telah diunduh.",
    });
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Laporan</p>
        <h1 className="mt-1 text-3xl font-bold">Export Data Booking</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ekspor semua data booking studio ke format spreadsheet untuk kebutuhan laporan.
        </p>
      </header>

      <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-8 shadow-xl shadow-primary/10">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  Total {bookings.length} booking siap diekspor
                </h2>
                <p className="text-sm text-muted-foreground">
                  Sudah termasuk data pelanggan, studio, frame, paket, dan pembayaran.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={downloadXLSX}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/40 transition hover:-translate-y-0.5"
            >
              <Download className="h-4 w-4" /> Export ke XLSX
            </button>
            <button
              onClick={downloadCSV}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-5 py-3 text-sm font-semibold transition hover:border-primary/50"
            >
              <Download className="h-4 w-4" /> Export ke CSV
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card/60 p-6">
        <h3 className="text-lg font-semibold">Kolom yang diekspor</h3>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((c) => (
            <span
              key={c}
              className="rounded-lg border border-border bg-background/40 px-3 py-2 text-sm"
            >
              {c}
            </span>
          ))}
        </div>
        <p className="mt-6 rounded-2xl border border-border bg-background/40 p-4 text-sm text-muted-foreground">
          Struktur data sudah kompatibel dengan Google Sheets API. Sistem ini juga dapat
          dideploy pada AWS EC2 dan dihubungkan ke database atau spreadsheet backend
          sesuai kebutuhan bisnis.
        </p>
      </div>
    </div>
  );
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
