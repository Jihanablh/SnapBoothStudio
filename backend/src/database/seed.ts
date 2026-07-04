/**
 * seed.ts — Database initialization script using better-sqlite3
 *
 * Usage:
 *   npm run db:init
 *
 * ⚠️  IMPORTANT: Stop the backend server before running this script!
 *   1. Press CTRL+C to stop `npm run dev`
 *   2. Run `npm run db:init`
 *   3. Run `npm run dev`
 */

import Database from "better-sqlite3";
import * as bcrypt from "bcryptjs";
import * as path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const DB_PATH    = process.env.DATABASE_PATH || "./src/database/snapbooth.db";
const SCHEMA_PATH = path.join(__dirname, "schema.sql");
const dbPath     = path.resolve(path.join(__dirname, "../../"), DB_PATH);
const dbDir      = path.dirname(dbPath);

console.log("\n🔧 SnapBooth Database Initialization");
console.log(`   DB Path: ${dbPath}`);
console.log("");

// ── Create directory if needed ────────────────────────────────────────────────
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// ── Open database (better-sqlite3 — synchronous, no WASM locking issues) ─────
let db: InstanceType<typeof Database>;
try {
  db = new Database(dbPath);
} catch (err) {
  const msg = (err as Error).message;
  if (msg.includes("SQLITE_BUSY") || msg.includes("locked")) {
    console.error("❌ Database sedang digunakan oleh proses lain.");
    console.error("   Matikan backend server terlebih dahulu (CTRL+C), lalu jalankan npm run db:init kembali.");
  } else {
    console.error("❌ Gagal membuka database:", msg);
  }
  process.exit(1);
}

// Enable WAL mode and busy timeout to reduce locking issues
db.pragma("journal_mode = WAL");
db.pragma("busy_timeout = 10000");
db.pragma("foreign_keys = ON");

try {
  // ── Apply Schema ─────────────────────────────────────────────────────────────
  const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
  db.exec(schema);
  console.log("✅ Schema applied.");

  // ── Seed Users ───────────────────────────────────────────────────────────────
  const adminPw = bcrypt.hashSync("admin123", 10);
  const userPw  = bcrypt.hashSync("user123",  10);

  function upsertUser(name: string, email: string, hash: string, role: string) {
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (!existing) {
      db.prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)").run(name, email, hash, role);
      console.log(`  ✓ Created ${role}: ${email}`);
    } else {
      console.log(`  ~ Skipped (exists): ${email}`);
    }
  }
  upsertUser("Admin SnapBooth", "admin@snapbooth.com", adminPw, "admin");
  upsertUser("Demo User",       "user@snapbooth.com",  userPw,  "user");
  console.log("✅ Users seeded.");

  // ── Seed Studios ─────────────────────────────────────────────────────────────
  const studios = [
    { name: "Blue Moment Studio",       slug: "blue-moment",       description: "Studio modern dengan tema biru elektrik dan pencahayaan LED.",       capacity: 4, theme_color: "#1a56db", base_price: 0 },
    { name: "Vintage Red Phone Studio", slug: "vintage-red-phone", description: "Studio bertema telepon merah retro dengan dekorasi vintage klasik.",  capacity: 2, theme_color: "#c8102e", base_price: 0 },
    { name: "Pixie Cinema Studio",      slug: "pixie-cinema",      description: "Studio dengan nuansa sinema dan film klasik. Lighting dramatis.",      capacity: 4, theme_color: "#6b2737", base_price: 0 },
    { name: "Newspaper Classic Studio", slug: "newspaper-classic", description: "Studio bergaya surat kabar hitam putih. Props koran dan aksesori.",   capacity: 6, theme_color: "#1a1a1a", base_price: 0 },
  ];
  for (const s of studios) {
    const ex = db.prepare("SELECT id FROM studios WHERE slug = ?").get(s.slug);
    if (!ex) {
      db.prepare("INSERT INTO studios (name, slug, description, capacity, theme_color, base_price) VALUES (?,?,?,?,?,?)").run(s.name, s.slug, s.description, s.capacity, s.theme_color, s.base_price);
    }
  }
  console.log("✅ Studios seeded.");

  // ── Seed Packages ─────────────────────────────────────────────────────────────
  const packages = [
    { name: "Quick Shot",      description: "Foto cepat, momen tetap berkesan.",  duration: 30,  maxPpl: 2, price: 35000,  benefits: JSON.stringify(["Durasi 30 menit","Maksimal 2 orang","1 pilihan frame","File digital basic"]), badge: null, rec: 0 },
    { name: "Studio Hour",     description: "Pilihan paling populer.",            duration: 60,  maxPpl: 4, price: 75000,  benefits: JSON.stringify(["Durasi 1 jam","Maksimal 4 orang","2 pilihan frame","File digital all photos","2 cetak foto"]), badge: "Best Seller", rec: 1 },
    { name: "Full Experience", description: "Pengalaman studio terlengkap.",      duration: 120, maxPpl: 6, price: 120000, benefits: JSON.stringify(["Durasi 2 jam","Maksimal 6 orang","Semua frame","File digital","6 cetak foto","Custom text"]), badge: "Best for Group", rec: 0 },
  ];
  for (const p of packages) {
    const ex = db.prepare("SELECT id FROM packages WHERE name = ?").get(p.name);
    if (!ex) {
      db.prepare("INSERT INTO packages (name, description, duration_minutes, max_people, price, benefits, badge, is_recommended) VALUES (?,?,?,?,?,?,?,?)").run(p.name, p.description, p.duration, p.maxPpl, p.price, p.benefits, p.badge, p.rec);
    }
  }
  console.log("✅ Packages seeded.");

  // ── Seed Frames ───────────────────────────────────────────────────────────────
  const frames = [
    { name: "Vintage Telephone",  slug: "vintage-telephone",    description: "Frame bergaya telepon vintage merah dengan dekorasi retro.", theme: "Vintage" },
    { name: "Every Moment Blue",  slug: "every-moment-blue",    description: "Frame modern dengan aksen biru elektrik dan tipografi bold.", theme: "Modern" },
    { name: "Pixie Film Cinema",  slug: "pixie-film-cinema",    description: "Frame cinematic dengan nuansa film dan cinema klasik.",      theme: "Cinema" },
    { name: "Good Times Gazette", slug: "good-times-newspaper", description: "Frame bergaya surat kabar hitam-putih yang unik dan artsy.", theme: "Newspaper" },
  ];
  for (const f of frames) {
    const ex = db.prepare("SELECT id FROM frames WHERE slug = ?").get(f.slug);
    if (!ex) {
      db.prepare("INSERT INTO frames (name, slug, description, theme) VALUES (?,?,?,?)").run(f.name, f.slug, f.description, f.theme);
    }
  }
  console.log("✅ Frames seeded.");

  // ── Seed Dummy Bookings ───────────────────────────────────────────────────────
  const adminRow  = db.prepare("SELECT id FROM users WHERE role='admin' LIMIT 1").get() as { id: number } | undefined;
  const studioRow = db.prepare("SELECT id FROM studios LIMIT 1").get() as { id: number } | undefined;
  const pkgRow    = db.prepare("SELECT id FROM packages ORDER BY price LIMIT 1 OFFSET 1").get() as { id: number } | undefined;
  const frameRow  = db.prepare("SELECT id FROM frames LIMIT 1").get() as { id: number } | undefined;

  const dummies = [
    { code: "SB-20260701-001", name: "Jihan Ablah",    wa: "081234567890", email: "jihan@email.com",  date: "2026-07-10", time: "10:00", dur: 60,  ppl: 3, status: "Confirmed", pay: "DP",          price: 75000 },
    { code: "SB-20260701-002", name: "Dito Ramadhan",  wa: "082345678901", email: "dito@email.com",   date: "2026-07-12", time: "13:00", dur: 30,  ppl: 2, status: "Pending",   pay: "Belum Bayar", price: 35000 },
    { code: "SB-20260701-003", name: "Siti Nurhaliza", wa: "083456789012", email: "siti@email.com",   date: "2026-07-08", time: "14:00", dur: 120, ppl: 5, status: "Completed", pay: "Lunas",       price: 120000 },
    { code: "SB-20260701-004", name: "Andi Pratama",   wa: "084567890123", email: "andi@email.com",   date: "2026-07-15", time: "11:00", dur: 60,  ppl: 2, status: "Confirmed", pay: "Lunas",       price: 75000 },
    { code: "SB-20260701-005", name: "Rizky Febian",   wa: "085678901234", email: "rizky@email.com",  date: "2026-07-06", time: "16:00", dur: 60,  ppl: 4, status: "Cancelled", pay: "Belum Bayar", price: 75000 },
  ];

  for (const b of dummies) {
    const ex = db.prepare("SELECT id FROM bookings WHERE booking_code = ?").get(b.code);
    if (!ex) {
      db.prepare(`
        INSERT INTO bookings (booking_code, user_id, customer_name, whatsapp, email, studio_id, package_id, frame_id, booking_date, start_time, duration_minutes, people_count, addons, total_price, payment_status, booking_status, notes)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `).run(b.code, adminRow?.id ?? null, b.name, b.wa, b.email, studioRow?.id ?? 1, pkgRow?.id ?? 2, frameRow?.id ?? 1, b.date, b.time, b.dur, b.ppl, "[]", b.price, b.pay, b.status, "Seed data demo.");

      const newBooking = db.prepare("SELECT id FROM bookings WHERE booking_code = ?").get(b.code) as { id: number } | undefined;
      if (newBooking) {
        db.prepare("INSERT INTO booking_activities (booking_id, activity_type, description) VALUES (?,?,?)").run(newBooking.id, "booking_created", `Booking ${b.code} atas nama ${b.name} berhasil dibuat.`);
      }
      console.log(`  ✓ Booking ${b.code}`);
    }
  }
  console.log("✅ Dummy bookings seeded.");

  console.log("\n🎉 Database berhasil diinisialisasi!");
  console.log("   Admin: admin@snapbooth.com / admin123");
  console.log("   User:  user@snapbooth.com  / user123");
  console.log("");
  console.log("   Jalankan backend: npm run dev");
  console.log("");

} catch (error) {
  const msg = (error as Error).message ?? String(error);

  if (msg.includes("SQLITE_BUSY") || msg.includes("locked") || msg.includes("database is locked")) {
    console.error("\n❌ Database sedang digunakan oleh proses lain.");
    console.error("   Solusi: Matikan backend server (CTRL+C) lalu jalankan npm run db:init kembali.\n");
  } else {
    console.error("\n❌ Database seed gagal:", msg);
  }
  process.exit(1);

} finally {
  // Always close the database connection after seed
  try { db.close(); } catch { /* ignore */ }
}
