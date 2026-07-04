import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileSpreadsheet, Download, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { apiExportCsv, apiExportXlsx } from "@/services/api";

export const Route = createFileRoute("/admin/export")({
  component: ExportPage,
  head: () => ({ meta: [{ title: "Export Data — Admin SnapBooth" }] }),
});

function ExportPage() {
  const [csvLoading, setCsvLoading] = useState(false);
  const [xlsxLoading, setXlsxLoading] = useState(false);
  const [lastExport, setLastExport] = useState<{ type: string; time: Date } | null>(null);

  async function handleExportCsv() {
    setCsvLoading(true);
    try {
      await apiExportCsv();
      setLastExport({ type: "CSV", time: new Date() });
      toast.success("Data booking berhasil diexport ke CSV.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Export gagal.";
      toast.error(msg);
    } finally {
      setCsvLoading(false);
    }
  }

  async function handleExportXlsx() {
    setXlsxLoading(true);
    try {
      await apiExportXlsx();
      setLastExport({ type: "XLSX", time: new Date() });
      toast.success("Data booking berhasil diexport ke spreadsheet Excel.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Export gagal.";
      toast.error(msg);
    } finally {
      setXlsxLoading(false);
    }
  }

  const exportColumns = [
    "ID Booking", "Kode Booking", "Nama Pelanggan", "WhatsApp", "Email",
    "Studio", "Paket", "Frame", "Tanggal Booking", "Jam Mulai",
    "Durasi (menit)", "Jumlah Orang", "Add-on", "Total Harga",
    "Status Booking", "Status Pembayaran", "Catatan", "Dibuat Pada",
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Laporan</p>
        <h1 className="mt-1 text-2xl font-bold">Export Spreadsheet</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Export seluruh data booking dari database SQLite ke file laporan.
        </p>
      </header>

      <div className="rounded-2xl border border-primary/20 bg-primary/10 px-5 py-4 text-sm text-primary flex items-start gap-3">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
        <p>Data diambil langsung dari <strong>SQLite database</strong> pada server, bukan dari state frontend. Pastikan backend API sedang berjalan.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* CSV Card */}
        <div className="rounded-3xl border border-border bg-card/60 p-8">
          <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/15">
            <FileText className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-lg font-bold">Export CSV</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Format CSV universal, bisa dibuka di Excel, Google Sheets, LibreOffice.
          </p>
          <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
            <li>✓ Kompatibel dengan semua spreadsheet app</li>
            <li>✓ Encoding UTF-8 dengan BOM untuk Excel</li>
            <li>✓ Data langsung dari SQLite</li>
          </ul>
          <button
            onClick={() => void handleExportCsv()}
            disabled={csvLoading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 py-3 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-60"
          >
            {csvLoading
              ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" /> Exporting...</>
              : <><Download className="h-4 w-4" /> Download CSV</>
            }
          </button>
        </div>

        {/* XLSX Card */}
        <div className="rounded-3xl border border-border bg-card/60 p-8">
          <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-primary/15">
            <FileSpreadsheet className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold">Export Excel (XLSX)</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Format Excel dengan tabel terstruktur, cocok untuk laporan presentasi.
          </p>
          <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
            <li>✓ Format Microsoft Excel (.xlsx)</li>
            <li>✓ Header kolom yang jelas</li>
            <li>✓ Data langsung dari SQLite</li>
          </ul>
          <button
            onClick={() => void handleExportXlsx()}
            disabled={xlsxLoading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {xlsxLoading
              ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Exporting...</>
              : <><Download className="h-4 w-4" /> Download XLSX</>
            }
          </button>
        </div>
      </div>

      {/* Last export info */}
      {lastExport && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          <span>
            Export {lastExport.type} berhasil pada {lastExport.time.toLocaleTimeString("id-ID")}
          </span>
        </div>
      )}

      {/* Columns info */}
      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <h3 className="font-semibold mb-4">Kolom yang Diekspor ({exportColumns.length} kolom)</h3>
        <div className="flex flex-wrap gap-2">
          {exportColumns.map((col) => (
            <span key={col} className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">
              {col}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
