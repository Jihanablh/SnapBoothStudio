/**
 * reset.ts — Hard reset database (development only!)
 *
 * Usage:
 *   npm run db:reset
 *
 * ⚠️  WARNING: This deletes all data! Use only in development.
 * ⚠️  IMPORTANT: Stop backend server before running this script!
 */

import * as path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { execSync } from "child_process";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const DB_PATH = process.env.DATABASE_PATH || "./src/database/snapbooth.db";
const dbPath  = path.resolve(path.join(__dirname, "../../"), DB_PATH);

console.log("\n⚠️  SnapBooth Database RESET (development only)");
console.log(`   DB Path: ${dbPath}`);
console.log("");

// Safety check: refuse if NODE_ENV is production
if (process.env.NODE_ENV === "production") {
  console.error("❌ db:reset TIDAK BOLEH dijalankan di environment production!");
  process.exit(1);
}

// Delete existing database files
const filesToDelete = [dbPath, `${dbPath}-wal`, `${dbPath}-shm`];
for (const f of filesToDelete) {
  if (fs.existsSync(f)) {
    fs.rmSync(f, { force: true });
    console.log(`  ✓ Deleted: ${path.basename(f)}`);
  }
}

// Also remove .lock directory if it exists (leftover from node-sqlite3-wasm)
const lockDir = `${dbPath}.lock`;
if (fs.existsSync(lockDir)) {
  fs.rmSync(lockDir, { recursive: true, force: true });
  console.log(`  ✓ Removed: ${path.basename(lockDir)}`);
}

console.log("");
console.log("🔄 Running seed...");
console.log("");

// Run seed
try {
  execSync("npx tsx src/database/seed.ts", {
    cwd: path.join(__dirname, "../../"),
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "development" },
  });
} catch {
  console.error("❌ Seed gagal. Lihat error di atas.");
  process.exit(1);
}
