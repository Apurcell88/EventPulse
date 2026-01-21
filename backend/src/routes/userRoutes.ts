import { Router } from "express";
import { authenticate } from "../authMiddleware";
import { getDashboard } from "../controllers/userController";
import {
  getNotificationSettings,
  updateNotificationSettings,
} from "../controllers/userSettingsController";

const router = Router();

router.get("/dashboard", authenticate, getDashboard); // GET /api/users/dashboard

// Notification settings
router.get("/settings/notifications", authenticate, getNotificationSettings);
router.put("/settings/notifications", authenticate, updateNotificationSettings);

export default router;
