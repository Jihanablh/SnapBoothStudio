import { Router } from "express";
import { getDashboardStats, getActivities } from "../controllers/dashboard.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";

const router = Router();
router.get("/stats",      authMiddleware, adminOnly, getDashboardStats);
router.get("/activities", authMiddleware, adminOnly, getActivities);

export default router;
