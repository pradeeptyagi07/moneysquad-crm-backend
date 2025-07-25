import { CombinedUser } from "../model/user/user.model";
import { hashPassword, verifyPassword } from "../utils/hash";
import { generateOTP, generateRandomPassword } from "../utils/helper";
import { generateToken } from "../utils/jwt";
import { sendForgotPassword, sendOtp, } from "./common.service";


export const authService = {
  async login(email: string, password: string) {
    const user = await CombinedUser.findOne({ email });

    console.log("user", user)
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isMatch = await verifyPassword(user.password, password);
    console.log("isMatch", isMatch)
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const token = generateToken(user.id);

    const { password: _, ...safeUser } = user.toObject();

    return { token, user: safeUser };
  },

  async sendOtp(email: string) {
    const user = await CombinedUser.findOne({ email });
    console.log("user", user)
    if (!user) throw new Error("User not found");

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = { code: otpCode, expiresAt };
    await user.save();

    await sendOtp(email, user.firstName || "User", otpCode);
  },


  async forgetPassword(email: string, otp: string) {
    const user = await CombinedUser.findOne({ email });
    if (!user) throw new Error("User not found");

    // Ensure OTP was sent
    if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
      throw new Error("No OTP found. Please request a new one.");
    }

    const now = new Date();
    const isExpired = now > user.otp.expiresAt;

    if (isExpired) {
      throw new Error("OTP has expired");
    }

    if (user.otp.code !== otp) {
      throw new Error("Invalid OTP");
    }

    const newPassword = generateRandomPassword();

    user.password = await hashPassword(newPassword);
    await user.save();
    await sendForgotPassword(email, user.firstName || "User", newPassword);
  },

  async resetPassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await CombinedUser.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const isMatch = await verifyPassword(user.password, currentPassword);

    if (!isMatch) {
      throw new Error("Current password is incorrect");
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();
  },

  async fetchUserById(userId: string) {
    const user = await CombinedUser.findById(userId);
    return user;
  },

  async updateUserById(userId: string, updateData: any) {
    console.log("🔍 Finding user:", userId);

    const user = await CombinedUser.findById(userId);
    if (!user) throw new Error("User not found");

    // Deep merge into nested schemas if present
    if (updateData.basicInfo) {
      Object.assign(user.basicInfo, updateData.basicInfo);
    }

    if (updateData.personalInfo) {
      Object.assign(user.personalInfo, updateData.personalInfo);
    }

    if (updateData.addressDetails) {
      Object.assign(user.addressDetails, updateData.addressDetails);
    }

    // Any top-level fields
    const topLevelFields = ['firstName', 'lastName', 'location', 'email', 'mobile'];
    for (const field of topLevelFields) {
      if (updateData[field] !== undefined) {
        (user as any)[field] = updateData[field];
      }
    }

    await user.save();

    console.log("✅ User updated successfully:", user._id);
    return user;
  }

};