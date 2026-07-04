import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.join(__dirname, "../.env") });

import express from "express";
import cors from "cors";

import authRoutes      from "./routes/auth.routes";
import bookingRoutes   from "./routes/booking.routes";
import catalogRoutes   from "./routes/catalog.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import exportRoutes    from "./routes/export.routes";
import { errorMiddleware } from "./middleware/error.middleware";

const app  = express();
const PORT = parseInt(process.env.PORT || "4000");

// ── CORS ──────────────────────────────────────────────────────────────────────
// Allow multiple frontend origins (Vite dev can use 5173, Lovable uses 8080)
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:3000",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:5173",
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any localhost origin in development
    if (process.env.NODE_ENV !== "production" && origin.includes("localhost")) {
      return callback(null, true);
    }
    callback(new Error(`CORS: Origin ${origin} tidak diizinkan`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Request logger (dev only) ─────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/api", (_req, res) => {
  res.json({
    success: true,
    message: "SnapBooth Studio API v1.0 🎉",
    status: "running",
    endpoints: [
      "GET  /api/health",
      "POST /api/auth/login",
      "POST /api/auth/register",
      "GET  /api/auth/me",
      "GET  /api/studios",
      "GET  /api/packages",
      "GET  /api/frames",
      "GET  /api/bookings",
      "GET  /api/dashboard/stats",
      "GET  /api/dashboard/activities",
    ],
  });
});

// Health check — open http://localhost:4000/api/health to verify backend is running
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend API SnapBooth berjalan",
    version: "1.0.0",
    port: PORT,
    timestamp: new Date().toISOString(),
    database: process.env.DATABASE_PATH || "./src/database/snapbooth.db",
  });
});

app.use("/api/auth",      authRoutes);
app.use("/api/bookings",  bookingRoutes);
app.use("/api",           catalogRoutes);    // handles /studios /packages /frames
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/export",    exportRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint tidak ditemukan: ${req.method} ${req.originalUrl}`,
    hint: "Pastikan VITE_API_URL=http://localhost:4000/api di file .env frontend",
    availableRoutes: [
      "GET  /api/health",
      "POST /api/auth/login",
      "POST /api/auth/register",
      "GET  /api/auth/me",
      "GET  /api/studios",
      "GET  /api/packages",
      "GET  /api/frames",
    ],
  });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorMiddleware);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 SnapBooth API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`   Client URL:  ${process.env.CLIENT_URL || "http://localhost:8080"}`);
  console.log(`   Health:      http://localhost:${PORT}/api/health`);
  console.log(`   Login:       POST http://localhost:${PORT}/api/auth/login\n`);
});

export default app;
