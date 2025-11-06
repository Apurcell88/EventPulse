import { Router } from "express";
import { authenticate } from "../authMiddleware";
import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
  getEventById,
} from "../controllers/eventController";
import { create } from "domain";

const router = Router();

// POST /api/events (requires login)
router.post("/", authenticate, createEvent);

// GET /api/events (anyone can see)
router.get("/", getEvents);

router.get("/:id", getEventById);

// PUT /api/events/:id
router.put("/:id", authenticate, updateEvent);

// DELETE /api/events/:id
router.delete("/:id", authenticate, deleteEvent);

export default router;
