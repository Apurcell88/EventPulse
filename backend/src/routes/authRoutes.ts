import { Router } from "express";
import {
  createUser,
  getCurrentUser,
  signInUser,
} from "../controllers/authController";
import { authenticate } from "../authMiddleware";

const router = Router();

router.post("/signin", signInUser); // POST /api/auth/signin

router.post("/signup", createUser);

router.get("/me", authenticate, getCurrentUser);

export default router;
