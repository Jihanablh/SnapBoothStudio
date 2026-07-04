import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Akses ditolak. Halaman ini hanya dapat diakses oleh admin.",
    });
    return;
  }
  next();
}
