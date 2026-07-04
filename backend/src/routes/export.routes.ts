import { Router } from "express";
import { exportCsv, exportXlsx } from "../controllers/export.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";

const router = Router();
router.get("/bookings/csv",  authMiddleware, adminOnly, exportCsv);
router.get("/bookings/xlsx", authMiddleware, adminOnly, exportXlsx);

export default router;
