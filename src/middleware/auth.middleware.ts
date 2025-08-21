import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { CombinedUser } from "../model/user/user.model";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Access denied" });
    return;
  }

  try {
    const decoded = verifyToken(token) as { userId: string; iat?: number; exp?: number };

    //  Always read current status from DB
    const user = await CombinedUser.findById(decoded.userId).select("role status");
    if (!user) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    // Invalidate all requests from inactive managers
    if (user.role === "manager" && user.status !== "active") {
      res.status(401).json({ error: "Account is inactive" });
      return;
    }

    // attach for controllers that need it
    (req as any).user = { ...decoded, role: user.role, status: user.status };
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
