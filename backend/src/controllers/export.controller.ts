import { Response } from "express";
import * as XLSX from "xlsx";
import getDb from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";

const COLUMNS = [
  { key: "id",               label: "ID" },
  { key: "booking_code",     label: "Kode Booking" },
  { key: "customer_name",    label: "Nama Pelanggan" },
  { key: "whatsapp",         label: "WhatsApp" },
  { key: "email",            label: "Email" },
  { key: "studio_name",      label: "Studio" },
  { key: "package_name",     label: "Paket" },
  { key: "frame_name",       label: "Frame" },
  { key: "booking_date",     label: "Tanggal Booking" },
  { key: "start_time",       label: "Jam Mulai" },
  { key: "duration_minutes", label: "Durasi (menit)" },
  { key: "people_count",     label: "Jumlah Orang" },
  { key: "addons",           label: "Add-on" },
  { key: "total_price",      label: "Total Harga (Rp)" },
  { key: "booking_status",   label: "Status Booking" },
  { key: "payment_status",   label: "Status Pembayaran" },
  { key: "notes",            label: "Catatan" },
  { key: "created_at",       label: "Dibuat Pada" },
];

function getRows(): Record<string, unknown>[] {
  return getDb().prepare(`
    SELECT b.*, s.name AS studio_name, p.name AS package_name, f.name AS frame_name
    FROM bookings b
    LEFT JOIN studios  s ON b.studio_id  = s.id
    LEFT JOIN packages p ON b.package_id = p.id
    LEFT JOIN frames   f ON b.frame_id   = f.id
    ORDER BY b.created_at DESC
  `).all() as Record<string, unknown>[];
}

export function exportCsv(_req: AuthRequest, res: Response): void {
  try {
    const rows = getRows();
    const header = COLUMNS.map((c) => c.label).join(",");
    const data   = rows.map((r) =>
      COLUMNS.map((c) => {
        const v = r[c.key];
        if (v === null || v === undefined) return "";
        return `"${String(v).replace(/"/g, '""')}"`;
      }).join(",")
    );
    const csv = [header, ...data].join("\r\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="snapbooth-bookings-${Date.now()}.csv"`);
    res.send("\uFEFF" + csv);
  } catch (err) {
    console.error("[export/csv]", err);
    res.status(500).json({ success: false, message: "Gagal export CSV." });
  }
}

export function exportXlsx(_req: AuthRequest, res: Response): void {
  try {
    const rows = getRows();
    const sheetData = rows.map((r) => {
      const row: Record<string, unknown> = {};
      COLUMNS.forEach((c) => { row[c.label] = r[c.key] ?? ""; });
      return row;
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="snapbooth-bookings-${Date.now()}.xlsx"`);
    res.send(buf);
  } catch (err) {
    console.error("[export/xlsx]", err);
    res.status(500).json({ success: false, message: "Gagal export XLSX." });
  }
}
