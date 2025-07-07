import { Router } from "express";
import { dashboardController } from "../controllers/dashboard/dashboard.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/funnel", authMiddleware, dashboardController.getFunnelData);
router.get("/snapshot", authMiddleware, dashboardController.getSnapshot);
router.get("/rejection-reason-count", authMiddleware, dashboardController.getRejectionReasonCount);

export default router;