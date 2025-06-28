import { Request, Response } from 'express';
import { successResponse, errorResponse } from "../utils/responseHandler";
import { sendContactEmail } from '../services/common.service';
import { authService } from '../services/auth.service';
import { unflattenObject } from '../utils/helper';


export const commonController = {

    async sendContactMessage(req: Request, res: Response) {
        try {
            const { firstName, lastName, email, phoneNumber, profession, message } = req.body;

            const data = await sendContactEmail({ firstName, lastName, email, phoneNumber, profession, message });

            successResponse(res, data, "Message sent successfully");

        } catch (error) {
            errorResponse(res, error);
        }
    },

    async getUserById(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const userData = await authService.fetchUserById(userId);
            res.status(200).json({ success: true, data: userData });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async updateUserData(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const updateData = unflattenObject(req.body);

            console.log("🔄 Received update request for user:", userId);
            console.log("📦 Update Payload:", updateData);

            const fieldsToParse = ['basicInfo', 'personalInfo', 'addressDetails'];
            for (const field of fieldsToParse) {
                if (updateData[field]) {
                    try {
                        updateData[field] = JSON.parse(updateData[field]);
                    } catch (e) {
                        console.warn(`⚠️ Failed to parse ${field}:`, e);
                    }
                }
            }


            const updatedUser = await authService.updateUserById(userId, updateData);

            res.status(200).json({
                success: true,
                message: "User data updated successfully",
                data: updatedUser
            });
        } catch (error: any) {
            console.error("❌ Error updating user data:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}