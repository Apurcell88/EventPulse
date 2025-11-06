import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request type so TypeScript knows about req.user
declare module "express-serve-static-core" {
  interface Request {
    user?: any;
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token; // read from HTTP-only cookie

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    ) as { id: number; email: string };
    req.user = { id: decoded.id, email: decoded.email }; // normalize to 'id'
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
