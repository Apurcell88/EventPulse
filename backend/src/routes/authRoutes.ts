import { Router } from "express";
import { createUser, signInUser } from "../controllers/authController";

const router = Router();

router.post("/signin", signInUser); // POST /api/auth/signin
router.post("/signup", createUser);

export default router;
