import { Router } from "express";
import { authenticate } from "../authMiddleware";
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notificationController";

const router = Router();

router.get("/", authenticate, getMyNotifications);
router.post("/read/:id", authenticate, markNotificationRead);
router.post("/read-all", authenticate, markAllNotificationsRead);

export default router;
