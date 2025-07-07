import { Request, Response } from "express";
import { dashboardService } from "../../services/dashboard/dashboard.service";

export const dashboardController = {
    async getFunnelData(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const { period, loanType, associateId } = req.query;
            const stages = await dashboardService.getFunnel({
                period: period as string,
                loanType: loanType as string,
                associateId: associateId as string,
                userId: userId as string
            });
            res.status(200).json({
                success: true,
                message: "Funnel data fetched successfully",
                stages,
            });
        } catch (error: any) {
            console.error("❌ Error in getFunnelData:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async getSnapshot(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const snapshot = await dashboardService.getSnapshot(userId);
            res.status(200).json({
                success: true,
                message: "Snapshot data fetched successfully",
                snapshot,
            });
        } catch (error: any) {
            console.error("❌ Error in getSnapshot:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async getRejectionReasonCount(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const { period, loanType, associateId } = req.query;
            const rejectionReasonCount = await dashboardService.getRejectionReasonCount({
                period: period as string,
                loanType: loanType as string,
                associateId: associateId as string,
                userId: userId as string
            });
            res.status(200).json({
                success: true,
                message: "Rejection reason count fetched successfully",
                rejectionReasonCount,
            });
        } catch (error: any) {
            console.error("❌ Error in getRejectionReasonCount:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}   