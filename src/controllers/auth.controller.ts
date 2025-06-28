import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { loginSchema } from "../validation/auth.validator";


export const authController = {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const { token, user } = await authService.login(email, password);
  
      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user,
      });
    } catch (err: any) {
      res.status(401).json({
        success: false,
        message: err.message || "Authentication failed",
      });
    }
  },

  async sendOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;
      await authService.sendOtp(email);
      res.status(200).json({ success: true, message: "OTP sent to your email" });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async forgetPassword(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      const newPassword = await authService.forgetPassword(email, otp);
      res.status(200).json({ success: true, message: "Password reset. Check your email." });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { currentPassword, newPassword } = req.body;

      await authService.resetPassword(userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to reset password",
      });
    }
  }
};