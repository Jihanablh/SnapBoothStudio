import { Response } from "express";
import getDb from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";

export function getDashboardStats(_req: AuthRequest, res: Response): void {
  try {
    const db = getDb();
    const total     = (db.prepare("SELECT COUNT(*) as c FROM bookings").get() as { c: number }).c;
    const pending   = (db.prepare("SELECT COUNT(*) as c FROM bookings WHERE booking_status='Pending'").get() as { c: number }).c;
    const confirmed = (db.prepare("SELECT COUNT(*) as c FROM bookings WHERE booking_status='Confirmed'").get() as { c: number }).c;
    const completed = (db.prepare("SELECT COUNT(*) as c FROM bookings WHERE booking_status='Completed'").get() as { c: number }).c;
    const cancelled = (db.prepare("SELECT COUNT(*) as c FROM bookings WHERE booking_status='Cancelled'").get() as { c: number }).c;

    const revenue   = (db.prepare("SELECT COALESCE(SUM(total_price),0) as total FROM bookings WHERE booking_status != 'Cancelled'").get() as { total: number }).total;
    const unpaid    = (db.prepare("SELECT COUNT(*) as c FROM bookings WHERE payment_status != 'Lunas' AND booking_status != 'Cancelled'").get() as { c: number }).c;

    const topStudio = db.prepare("SELECT s.name, COUNT(*) as cnt FROM bookings b LEFT JOIN studios s ON b.studio_id = s.id WHERE b.booking_status != 'Cancelled' GROUP BY b.studio_id ORDER BY cnt DESC LIMIT 1").get() as { name: string } | undefined;
    const topFrame  = db.prepare("SELECT f.name, COUNT(*) as cnt FROM bookings b LEFT JOIN frames  f ON b.frame_id  = f.id WHERE b.booking_status != 'Cancelled' GROUP BY b.frame_id  ORDER BY cnt DESC LIMIT 1").get() as { name: string } | undefined;

    res.json({
      success: true,
      data: {
        total_bookings: total, pending, confirmed, completed, cancelled,
        total_revenue: revenue, unpaid_count: unpaid,
        most_booked_studio: topStudio?.name ?? "-",
        most_used_frame:    topFrame?.name  ?? "-",
      },
    });
  } catch (err) {
    console.error("[dashboard/stats]", err);
    res.status(500).json({ success: false, message: "Gagal mengambil statistik dashboard." });
  }
}

export function getActivities(_req: AuthRequest, res: Response): void {
  try {
    const activities = getDb().prepare(`
      SELECT ba.*, b.booking_code, b.customer_name
      FROM booking_activities ba
      LEFT JOIN bookings b ON ba.booking_id = b.id
      ORDER BY ba.created_at DESC LIMIT 20
    `).all();
    res.json({ success: true, data: activities });
  } catch (err) {
    console.error("[dashboard/activities]", err);
    res.status(500).json({ success: false, message: "Gagal mengambil aktivitas." });
  }
}
