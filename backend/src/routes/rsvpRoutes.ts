import { Router } from "express";
import { authenticate } from "../authMiddleware";
import { rsvpEvent } from "../controllers/rsvpController";

const router = Router();

// POST /api/rsvps
router.post("/", authenticate, rsvpEvent);

export default router;
