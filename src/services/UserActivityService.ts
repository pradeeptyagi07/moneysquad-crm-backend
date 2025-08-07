import { Request, Response, NextFunction } from "express";
import {CombinedUser} from "../model/user/user.model"; 

class UserActivityService {
  async updateLastSeen(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (userId) {
        await CombinedUser.findByIdAndUpdate(userId, {
          $set: {
            lastSeen: new Date(),
            role: 'partner', // Optional: only set if required
          },
        });
      }
    } catch (err) {
      console.error('❌ Failed to update lastSeen:', err);
    } finally {
      next(); // Ensure request continues
    }
  }
}

export const userActivityService = new UserActivityService();
