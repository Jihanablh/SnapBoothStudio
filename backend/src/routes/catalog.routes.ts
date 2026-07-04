import { Router } from "express";
import {
  getAllStudios, getStudioById, createStudio, updateStudio, deleteStudio,
  getAllPackages, getPackageById, createPackage, updatePackage, deletePackage,
  getAllFrames, getFrameById, createFrame, updateFrame, deleteFrame,
} from "../controllers/catalog.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";

const router = Router();

// Studios
router.get("/studios",        getAllStudios);
router.get("/studios/:id",    getStudioById);
router.post("/studios",       authMiddleware, adminOnly, createStudio);
router.put("/studios/:id",    authMiddleware, adminOnly, updateStudio);
router.delete("/studios/:id", authMiddleware, adminOnly, deleteStudio);

// Packages
router.get("/packages",        getAllPackages);
router.get("/packages/:id",    getPackageById);
router.post("/packages",       authMiddleware, adminOnly, createPackage);
router.put("/packages/:id",    authMiddleware, adminOnly, updatePackage);
router.delete("/packages/:id", authMiddleware, adminOnly, deletePackage);

// Frames
router.get("/frames",        getAllFrames);
router.get("/frames/:id",    getFrameById);
router.post("/frames",       authMiddleware, adminOnly, createFrame);
router.put("/frames/:id",    authMiddleware, adminOnly, updateFrame);
router.delete("/frames/:id", authMiddleware, adminOnly, deleteFrame);

export default router;
