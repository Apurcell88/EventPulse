import { Request, Response } from "express";
import prisma from "../prismaClient";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// POST /api/auth
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    // Generate JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });

    res.status(201).json({
      message: "User created successfully",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/users
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: { events: true, rsvps: true },
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const signInUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1h" }
    );

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only HTTPS in production
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // use "lax" in dev
      maxAge: 24 * 60 * 60 * 1000, // 1 hour
    });

    // Optional: generate a JWT here for future protected routes
    res.status(200).json({
      message: "Sign-in successful",
      user: { id: user.id, name: user.name, email: user.email },
      // token,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) return res.json({ user: null });

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ user: null });
  }
};

// POST /api/auth/signout
export const signOutUser = (req: Request, res: Response) => {
  try {
    // Clear the cookie by setting it to an empty value and immediate expiration
    res.cookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      expires: new Date(0), // set to past date
    });

    res.status(200).json({ message: "Signed out successfully" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
