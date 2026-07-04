-- SnapBooth Studio Database Schema
-- SQLite Database

PRAGMA foreign_keys = ON;

-- ─── USERS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin', 'user')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── STUDIOS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS studios (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  capacity    INTEGER NOT NULL DEFAULT 4,
  theme_color TEXT DEFAULT '#1a56db',
  base_price  INTEGER NOT NULL DEFAULT 0,
  image_url   TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── PACKAGES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS packages (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  name             TEXT NOT NULL,
  description      TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  max_people       INTEGER NOT NULL DEFAULT 4,
  price            INTEGER NOT NULL,
  benefits         TEXT,
  badge            TEXT,
  is_recommended   INTEGER NOT NULL DEFAULT 0,
  is_active        INTEGER NOT NULL DEFAULT 1,
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── FRAMES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS frames (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  theme         TEXT,
  preview_image TEXT,
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── BOOKINGS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_code     TEXT NOT NULL UNIQUE,
  user_id          INTEGER REFERENCES users(id) ON DELETE SET NULL,
  customer_name    TEXT NOT NULL,
  whatsapp         TEXT NOT NULL,
  email            TEXT,
  studio_id        INTEGER NOT NULL REFERENCES studios(id),
  package_id       INTEGER NOT NULL REFERENCES packages(id),
  frame_id         INTEGER NOT NULL REFERENCES frames(id),
  booking_date     TEXT NOT NULL,
  start_time       TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  people_count     INTEGER NOT NULL DEFAULT 1,
  addons           TEXT DEFAULT '[]',
  total_price      INTEGER NOT NULL DEFAULT 0,
  payment_status   TEXT NOT NULL DEFAULT 'Belum Bayar' CHECK(payment_status IN ('Belum Bayar', 'DP', 'Lunas')),
  booking_status   TEXT NOT NULL DEFAULT 'Pending' CHECK(booking_status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
  notes            TEXT,
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── BOOKING ACTIVITIES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS booking_activities (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id    INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description   TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
