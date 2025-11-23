import { Router } from "express";
import { authenticate } from "../authMiddleware";
import {
  getMessagesForEvent,
  createMessage,
} from "../controllers/messageController";

const router = Router();

router.get("/:eventId", authenticate, getMessagesForEvent);
router.post("/", authenticate, createMessage);

export default router;
