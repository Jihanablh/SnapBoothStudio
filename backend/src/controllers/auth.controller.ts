import { Request, Response } from "express";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import getDb from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";

const JWT_SECRET = process.env.JWT_SECRET || "snapbooth_secret_key_2024";

interface DbUser {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: string;
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body as { name?: string; email?: string; password?: string };

    if (!name?.trim() || !email?.trim() || !password) {
      res.status(400).json({ success: false, message: "Nama, email, dan password wajib diisi." });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ success: false, message: "Password minimal 6 karakter." });
      return;
    }

    const db = getDb();
    const normalizedEmail = email.toLowerCase().trim();
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(normalizedEmail) as { id: number } | undefined;
    if (existing) {
      res.status(409).json({ success: false, message: "Email sudah terdaftar. Gunakan email lain atau login." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    db.prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'user')").run(name.trim(), normalizedEmail, passwordHash);
    const newUser = db.prepare("SELECT id FROM users WHERE email = ?").get(normalizedEmail) as { id: number };

    const token = jwt.sign({ id: newUser.id, email: normalizedEmail, role: "user" }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({
      success: true,
      message: "Registrasi berhasil.",
      token,
      user: { id: newUser.id, name: name.trim(), email: normalizedEmail, role: "user" },
    });
  } catch (err) {
    console.error("[auth/register]", err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server saat registrasi." });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email?.trim() || !password) {
      res.status(400).json({ success: false, message: "Email dan password wajib diisi." });
      return;
    }

    const db = getDb();
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase().trim()) as DbUser | undefined;

    if (!user) {
      res.status(401).json({ success: false, message: "Email atau password salah." });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ success: false, message: "Email atau password salah." });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      success: true,
      message: "Login berhasil.",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("[auth/login]", err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server saat login." });
  }
}

export function getMe(req: AuthRequest, res: Response): void {
  try {
    const db = getDb();
    const user = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(req.user!.id) as { id: number; name: string; email: string; role: string } | undefined;
    if (!user) {
      res.status(404).json({ success: false, message: "User tidak ditemukan." });
      return;
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error("[auth/me]", err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
}

// Alias for route compatibility
export const getCurrentUser = getMe;
