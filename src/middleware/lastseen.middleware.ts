// middleware/lastSeenAuth.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export const lastSeenAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    // No token → skip silently
    return next();
  }

  try {
    const decoded = verifyToken(token);
    (req as any).user = decoded; // Attach decoded payload (should have userId & role)
  } catch (error) {
    // Invalid token → skip silently (we don't block for last seen)
  }

  next();
};
