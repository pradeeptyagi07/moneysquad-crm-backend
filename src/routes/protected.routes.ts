import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { userActivityService } from "../services/UserActivityService";

const protectedRouter = Router();

// All protected routes will first pass through auth and lastSeen middleware
protectedRouter.use(authMiddleware, userActivityService.updateLastSeen.bind(userActivityService));

export { protectedRouter };
