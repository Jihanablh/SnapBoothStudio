import { Response } from "express";
import getDb from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";

// ── Helpers ──────────────────────────────────────────────────────────────────
function generateBookingCode(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const db = getDb();
  const count = ((db.prepare("SELECT COUNT(*) as c FROM bookings").get() as { c: number } | undefined)?.c ?? 0) + 1;
  return `SB-${date}-${String(count).padStart(3, "0")}`;
}

function logActivity(booking_id: number, activity_type: string, description: string) {
  try {
    getDb().prepare("INSERT INTO booking_activities (booking_id, activity_type, description) VALUES (?,?,?)").run(booking_id, activity_type, description);
  } catch { /* non-critical */ }
}

// ── Get All Bookings ──────────────────────────────────────────────────────────
export function getAllBookings(req: AuthRequest, res: Response): void {
  try {
    const db = getDb();
    const { status, payment_status, search } = req.query;
    const params: (string | number)[] = [];

    let query = `
      SELECT b.*,
        s.name AS studio_name, p.name AS package_name, f.name AS frame_name, u.name AS user_name
      FROM bookings b
      LEFT JOIN studios  s ON b.studio_id  = s.id
      LEFT JOIN packages p ON b.package_id = p.id
      LEFT JOIN frames   f ON b.frame_id   = f.id
      LEFT JOIN users    u ON b.user_id    = u.id
      WHERE 1=1
    `;

    if (req.user?.role !== "admin") {
      query += ` AND b.user_id = ?`;
      params.push(req.user!.id);
    }
    if (status) { query += ` AND b.booking_status = ?`; params.push(status as string); }
    if (payment_status) { query += ` AND b.payment_status = ?`; params.push(payment_status as string); }
    if (search) {
      query += ` AND (b.customer_name LIKE ? OR b.whatsapp LIKE ? OR b.booking_code LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    query += ` ORDER BY b.created_at DESC`;

    // better-sqlite3: spread array params
    const bookings = db.prepare(query).all(...params);
    res.json({ success: true, data: bookings });
  } catch (err) {
    console.error("[bookings/getAll]", err);
    res.status(500).json({ success: false, message: "Gagal mengambil data booking." });
  }
}

// ── Get Booking By ID ─────────────────────────────────────────────────────────
export function getBookingById(req: AuthRequest, res: Response): void {
  try {
    const booking = getDb().prepare(`
      SELECT b.*, s.name AS studio_name, p.name AS package_name, f.name AS frame_name
      FROM bookings b
      LEFT JOIN studios  s ON b.studio_id  = s.id
      LEFT JOIN packages p ON b.package_id = p.id
      LEFT JOIN frames   f ON b.frame_id   = f.id
      WHERE b.id = ?
    `).get(req.params.id);
    if (!booking) { res.status(404).json({ success: false, message: "Booking tidak ditemukan." }); return; }
    res.json({ success: true, data: booking });
  } catch (err) {
    console.error("[bookings/getById]", err);
    res.status(500).json({ success: false, message: "Gagal mengambil detail booking." });
  }
}

// ── Create Booking ────────────────────────────────────────────────────────────
export function createBooking(req: AuthRequest, res: Response): void {
  try {
    const db = getDb();
    const { customer_name, whatsapp, email, studio_id, package_id, frame_id, booking_date, start_time, duration_minutes, people_count, addons = [], notes } = req.body;

    if (!customer_name || !whatsapp || !studio_id || !package_id || !frame_id || !booking_date || !start_time) {
      res.status(400).json({ success: false, message: "Data booking tidak lengkap. Isi semua field yang diperlukan." });
      return;
    }

    const pkg = db.prepare("SELECT price FROM packages WHERE id = ?").get(package_id) as { price: number } | undefined;
    if (!pkg) { res.status(400).json({ success: false, message: "Paket tidak ditemukan." }); return; }

    const addonPrices: Record<string, number> = {
      "Extra Time (+30 menit)":    20000,
      "Cetak Foto Tambahan":       10000,
      "File Digital All Photos":   15000,
      "Custom Frame Text":         15000,
    };
    const addonTotal = (Array.isArray(addons) ? addons : []).reduce((s: number, a: string) => s + (addonPrices[a] ?? 0), 0);
    const total_price = pkg.price + addonTotal;
    const booking_code = generateBookingCode();

    db.prepare(`
      INSERT INTO bookings (booking_code, user_id, customer_name, whatsapp, email, studio_id, package_id, frame_id, booking_date, start_time, duration_minutes, people_count, addons, total_price, payment_status, booking_status, notes)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,'Belum Bayar','Pending',?)
    `).run(booking_code, req.user?.id ?? null, customer_name, whatsapp, email ?? null, studio_id, package_id, frame_id, booking_date, start_time, duration_minutes ?? 60, people_count ?? 1, JSON.stringify(addons), total_price, notes ?? null);

    const created = db.prepare("SELECT * FROM bookings WHERE booking_code = ?").get(booking_code) as { id: number } & Record<string, unknown>;
    if (created?.id) logActivity(created.id, "booking_created", `Booking ${booking_code} atas nama ${customer_name} berhasil dibuat.`);

    res.status(201).json({ success: true, message: "Booking berhasil dibuat.", data: created });
  } catch (err) {
    console.error("[bookings/create]", err);
    res.status(500).json({ success: false, message: "Gagal membuat booking." });
  }
}

// ── Update Booking ────────────────────────────────────────────────────────────
export function updateBooking(req: AuthRequest, res: Response): void {
  try {
    const db = getDb();
    const existing = db.prepare("SELECT * FROM bookings WHERE id = ?").get(req.params.id) as Record<string, unknown> | undefined;
    if (!existing) { res.status(404).json({ success: false, message: "Booking tidak ditemukan." }); return; }

    if (req.user?.role !== "admin") {
      if (existing.user_id !== req.user?.id || existing.booking_status !== "Pending") {
        res.status(403).json({ success: false, message: "Tidak memiliki akses untuk mengubah booking ini." });
        return;
      }
    }

    const { customer_name, whatsapp, email, studio_id, package_id, frame_id, booking_date, start_time, duration_minutes, people_count, addons, notes, booking_status, payment_status } = req.body;

    db.prepare(`
      UPDATE bookings SET
        customer_name=?, whatsapp=?, email=?, studio_id=?, package_id=?, frame_id=?,
        booking_date=?, start_time=?, duration_minutes=?, people_count=?,
        addons=?, notes=?, booking_status=?, payment_status=?, updated_at=datetime('now')
      WHERE id=?
    `).run(
      customer_name ?? existing.customer_name,
      whatsapp ?? existing.whatsapp,
      email ?? existing.email,
      studio_id ?? existing.studio_id,
      package_id ?? existing.package_id,
      frame_id ?? existing.frame_id,
      booking_date ?? existing.booking_date,
      start_time ?? existing.start_time,
      duration_minutes ?? existing.duration_minutes,
      people_count ?? existing.people_count,
      addons ? JSON.stringify(addons) : existing.addons,
      notes ?? existing.notes,
      booking_status ?? existing.booking_status,
      payment_status ?? existing.payment_status,
      req.params.id,
    );

    logActivity(existing.id as number, "booking_updated", `Booking ${existing.booking_code} diperbarui.`);
    const updated = db.prepare("SELECT * FROM bookings WHERE id = ?").get(req.params.id);
    res.json({ success: true, message: "Booking berhasil diperbarui.", data: updated });
  } catch (err) {
    console.error("[bookings/update]", err);
    res.status(500).json({ success: false, message: "Gagal memperbarui booking." });
  }
}

// ── Update Status ─────────────────────────────────────────────────────────────
export function updateBookingStatus(req: AuthRequest, res: Response): void {
  try {
    const db = getDb();
    const existing = db.prepare("SELECT * FROM bookings WHERE id = ?").get(req.params.id) as Record<string, unknown> | undefined;
    if (!existing) { res.status(404).json({ success: false, message: "Booking tidak ditemukan." }); return; }

    const { booking_status, payment_status } = req.body;
    db.prepare("UPDATE bookings SET booking_status=?,payment_status=?,updated_at=datetime('now') WHERE id=?").run(
      booking_status ?? existing.booking_status,
      payment_status ?? existing.payment_status,
      req.params.id,
    );

    if (booking_status) logActivity(existing.id as number, "status_updated", `Status booking ${existing.booking_code} diubah menjadi ${booking_status}.`);
    if (payment_status) logActivity(existing.id as number, "payment_updated", `Status pembayaran ${existing.booking_code} diubah menjadi ${payment_status}.`);

    res.json({ success: true, message: "Status berhasil diperbarui." });
  } catch (err) {
    console.error("[bookings/status]", err);
    res.status(500).json({ success: false, message: "Gagal memperbarui status." });
  }
}

// ── Delete Booking ────────────────────────────────────────────────────────────
export function deleteBooking(req: AuthRequest, res: Response): void {
  try {
    const db = getDb();
    const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(req.params.id) as Record<string, unknown> | undefined;
    if (!booking) { res.status(404).json({ success: false, message: "Booking tidak ditemukan." }); return; }
    db.prepare("DELETE FROM bookings WHERE id = ?").run(req.params.id);
    res.json({ success: true, message: `Booking ${booking.booking_code} berhasil dihapus.` });
  } catch (err) {
    console.error("[bookings/delete]", err);
    res.status(500).json({ success: false, message: "Gagal menghapus booking." });
  }
}
