import { Response } from "express";
import getDb from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";

// ── Generic CRUD factory ──────────────────────────────────────────────────────
function makeGetAll(table: string) {
  return (_req: AuthRequest, res: Response): void => {
    try {
      const rows = getDb().prepare(`SELECT * FROM ${table} WHERE is_active = 1 ORDER BY id`).all();
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error(`[${table}/getAll]`, err);
      res.status(500).json({ success: false, message: `Gagal mengambil data ${table}.` });
    }
  };
}

function makeGetById(table: string) {
  return (req: AuthRequest, res: Response): void => {
    try {
      const row = getDb().prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
      if (!row) { res.status(404).json({ success: false, message: "Data tidak ditemukan." }); return; }
      res.json({ success: true, data: row });
    } catch {
      res.status(500).json({ success: false, message: "Gagal mengambil detail." });
    }
  };
}

// ── Studios ───────────────────────────────────────────────────────────────────
export const getAllStudios  = makeGetAll("studios");
export const getStudioById = makeGetById("studios");

export function createStudio(req: AuthRequest, res: Response): void {
  try {
    const { name, slug, description, capacity, theme_color, base_price } = req.body;
    getDb().prepare("INSERT INTO studios (name, slug, description, capacity, theme_color, base_price) VALUES (?,?,?,?,?,?)").run(name, slug, description, capacity ?? 4, theme_color ?? "#1a56db", base_price ?? 0);
    res.status(201).json({ success: true, message: "Studio berhasil dibuat." });
  } catch (err: unknown) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
}

export function updateStudio(req: AuthRequest, res: Response): void {
  try {
    const { name, description, capacity, theme_color, base_price, is_active } = req.body;
    const db = getDb();
    const s = db.prepare("SELECT * FROM studios WHERE id = ?").get(req.params.id) as Record<string, unknown>;
    if (!s) { res.status(404).json({ success: false, message: "Studio tidak ditemukan." }); return; }
    db.prepare("UPDATE studios SET name=?,description=?,capacity=?,theme_color=?,base_price=?,is_active=?,updated_at=datetime('now') WHERE id=?")
      .run(name??s.name, description??s.description, capacity??s.capacity, theme_color??s.theme_color, base_price??s.base_price, is_active??s.is_active, req.params.id);
    res.json({ success: true, message: "Studio berhasil diperbarui." });
  } catch (err: unknown) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
}

export function deleteStudio(req: AuthRequest, res: Response): void {
  try {
    getDb().prepare("UPDATE studios SET is_active=0,updated_at=datetime('now') WHERE id=?").run(req.params.id);
    res.json({ success: true, message: "Studio berhasil dihapus." });
  } catch {
    res.status(500).json({ success: false, message: "Gagal menghapus studio." });
  }
}

// ── Packages ──────────────────────────────────────────────────────────────────
export const getAllPackages  = makeGetAll("packages");
export const getPackageById = makeGetById("packages");

export function createPackage(req: AuthRequest, res: Response): void {
  try {
    const { name, description, duration_minutes, max_people, price, benefits, badge, is_recommended } = req.body;
    getDb().prepare("INSERT INTO packages (name, description, duration_minutes, max_people, price, benefits, badge, is_recommended) VALUES (?,?,?,?,?,?,?,?)").run(name, description, duration_minutes ?? 60, max_people ?? 4, price, JSON.stringify(benefits ?? []), badge ?? null, is_recommended ? 1 : 0);
    res.status(201).json({ success: true, message: "Paket berhasil dibuat." });
  } catch (err: unknown) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
}

export function updatePackage(req: AuthRequest, res: Response): void {
  try {
    const { name, description, duration_minutes, max_people, price, benefits, badge, is_recommended, is_active } = req.body;
    const db = getDb();
    const p = db.prepare("SELECT * FROM packages WHERE id = ?").get(req.params.id) as Record<string, unknown>;
    if (!p) { res.status(404).json({ success: false, message: "Paket tidak ditemukan." }); return; }
    db.prepare("UPDATE packages SET name=?,description=?,duration_minutes=?,max_people=?,price=?,benefits=?,badge=?,is_recommended=?,is_active=?,updated_at=datetime('now') WHERE id=?")
      .run(name??p.name, description??p.description, duration_minutes??p.duration_minutes, max_people??p.max_people, price??p.price, benefits?JSON.stringify(benefits):(p.benefits as string), badge??p.badge, is_recommended!=null?is_recommended:p.is_recommended, is_active??p.is_active, req.params.id);
    res.json({ success: true, message: "Paket berhasil diperbarui." });
  } catch (err: unknown) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
}

export function deletePackage(req: AuthRequest, res: Response): void {
  try {
    getDb().prepare("UPDATE packages SET is_active=0,updated_at=datetime('now') WHERE id=?").run(req.params.id);
    res.json({ success: true, message: "Paket berhasil dihapus." });
  } catch {
    res.status(500).json({ success: false, message: "Gagal menghapus paket." });
  }
}

// ── Frames ────────────────────────────────────────────────────────────────────
export const getAllFrames  = makeGetAll("frames");
export const getFrameById = makeGetById("frames");

export function createFrame(req: AuthRequest, res: Response): void {
  try {
    const { name, slug, description, theme } = req.body;
    getDb().prepare("INSERT INTO frames (name, slug, description, theme) VALUES (?,?,?,?)").run(name, slug, description, theme);
    res.status(201).json({ success: true, message: "Frame berhasil dibuat." });
  } catch (err: unknown) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
}

export function updateFrame(req: AuthRequest, res: Response): void {
  try {
    const { name, description, theme, is_active } = req.body;
    const db = getDb();
    const f = db.prepare("SELECT * FROM frames WHERE id = ?").get(req.params.id) as Record<string, unknown>;
    if (!f) { res.status(404).json({ success: false, message: "Frame tidak ditemukan." }); return; }
    db.prepare("UPDATE frames SET name=?,description=?,theme=?,is_active=?,updated_at=datetime('now') WHERE id=?").run(name??f.name, description??f.description, theme??f.theme, is_active??f.is_active, req.params.id);
    res.json({ success: true, message: "Frame berhasil diperbarui." });
  } catch (err: unknown) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
}

export function deleteFrame(req: AuthRequest, res: Response): void {
  try {
    getDb().prepare("UPDATE frames SET is_active=0,updated_at=datetime('now') WHERE id=?").run(req.params.id);
    res.json({ success: true, message: "Frame berhasil dihapus." });
  } catch {
    res.status(500).json({ success: false, message: "Gagal menghapus frame." });
  }
}
