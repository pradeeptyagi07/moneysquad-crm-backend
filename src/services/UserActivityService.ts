import { Request, Response, NextFunction } from "express";
import { CombinedUser } from "../model/user/user.model";

export async function updateLastSeen(req: Request, _res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.userId;

    if (userId) {
      // Fetch the user's role from DB
      const user = await CombinedUser.findById(userId).select("role");

      if (user?.role === "partner") {
        await CombinedUser.updateOne(
          { _id: userId },
          { $set: { lastSeen: new Date() } }
        );
      }
    }
  } catch (err) {
    console.error("Failed to update lastSeen:", err);
  } finally {
    next();
  }
}
