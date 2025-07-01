import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import upload from "../utils/multer";
// import { loginController } from "../controllers/auth.controller";

const router = Router();

router.post("/login", authController.login);

router.post("/send-opt", authController.sendOtp);

router.post("/forgot-password", authController.forgetPassword);

router.post("/reset-password", authMiddleware, upload.none(), authController.resetPassword);

export default router;