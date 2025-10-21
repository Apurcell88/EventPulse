import { Router } from "express";
import { authenticate } from "../authMiddleware";
import { createEvent, getEvents } from "../controllers/eventController";
import { create } from "domain";

const router = Router();

// POST /api/events (requires login)
router.post("/", authenticate, createEvent);

// GET /api/events (anyone can see)
router.get("/", getEvents);

export default router;
