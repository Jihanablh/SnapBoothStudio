import { Router } from "express";
import {
  getAllBookings, getBookingById, createBooking,
  updateBooking, updateBookingStatus, deleteBooking
} from "../controllers/booking.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";

const router = Router();

router.get("/",        authMiddleware, getAllBookings);
router.get("/:id",     authMiddleware, getBookingById);
router.post("/",       authMiddleware, createBooking);
router.put("/:id",     authMiddleware, updateBooking);
router.patch("/:id/status", authMiddleware, adminOnly, updateBookingStatus);
router.delete("/:id",  authMiddleware, adminOnly, deleteBooking);

export default router;
