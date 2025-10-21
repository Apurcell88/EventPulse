import { Router } from "express";
import { authenticate } from "../authMiddleware";
import { getDashboard } from "../controllers/userController";

const router = Router();

router.get("/dashboard", authenticate, getDashboard); // GET /api/users/dashboard

export default router;
