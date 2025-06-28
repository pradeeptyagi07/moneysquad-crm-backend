import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        res.status(401).json({ error: "Access denied" });
        return; // Explicit return to avoid calling `next()`
    }

    try {
        const decoded = verifyToken(token);
        console.log("decoded", decoded);
        (req as any).user = decoded;
        next(); // Proceed to next middleware/controller
    } catch (error) {
        res.status(400).json({ error: "Invalid token" });
        return;
    }
};