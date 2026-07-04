/**
 * Database configuration — uses better-sqlite3 (synchronous, stable, no WASM locking issues)
 *
 * better-sqlite3 advantages over node-sqlite3-wasm:
 *  - Truly synchronous API (no async complexity)
 *  - No .lock directory issues on Windows
 *  - Native Node.js addon — fully supports Node v24
 *  - WAL mode supported for better concurrent reads
 *  - db.close() reliably releases file handles
 */

import Database, { type Database as BetterDB } from "better-sqlite3";
import * as path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../../.env") });

// ── Exported type aliases so rest of codebase doesn't change ─────────────────
export type SqliteDb = BetterDB;

// ── Path resolution ───────────────────────────────────────────────────────────
function getDbPath(): string {
  const raw = process.env.DATABASE_PATH || "./src/database/snapbooth.db";
  return path.resolve(path.join(__dirname, "../../"), raw);
}

// ── Open database ─────────────────────────────────────────────────────────────
function openDb(): BetterDB {
  const dbPath = getDbPath();
  const dbDir  = path.dirname(dbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = new Database(dbPath);

  // WAL mode: allows multiple readers + 1 writer simultaneously
  db.pragma("journal_mode = WAL");
  // Wait up to 10 seconds if DB is busy before throwing
  db.pragma("busy_timeout = 10000");
  // Enforce foreign key constraints
  db.pragma("foreign_keys = ON");

  return db;
}

// ── Singleton — survives tsx hot-reloads ─────────────────────────────────────
declare global {
  // eslint-disable-next-line no-var
  var __snapbooth_db: BetterDB | undefined;
}

export function getDb(): BetterDB {
  if (!global.__snapbooth_db || !global.__snapbooth_db.open) {
    global.__snapbooth_db = openDb();
    console.log(`[DB] Connected: ${getDbPath()}`);
  }
  return global.__snapbooth_db;
}

export default getDb;
