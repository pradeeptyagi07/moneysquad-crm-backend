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
            const { period, loanType, associateId } = req.query;
            const snapshot = await dashboardService.getSnapshot({
                period: period as string,
                loanType: loanType as string,
                associateId: associateId as string,
                userId: userId as string
            });
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
    },

    async getTrends(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const { trendMonths, loanType, associateId } = req.query;
            const trends = await dashboardService.getTrends({
                trendMonths: Number(trendMonths),
                loanType: loanType as string,
                associateId: associateId as string,
                userId: userId as string
            });
            res.status(200).json({
                success: true,
                message: "Trends fetched successfully",
                trends,
            });
        } catch (error: any) {
            console.error("❌ Error in getTrends:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async getMatrix(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const { period, loanType, associateId } = req.query;
            const matrix = await dashboardService.getMatrix({
                period: period as string,
                loanType: loanType as string,
                associateId: associateId as string,
                userId: userId as string
            });
            res.status(200).json({
                success: true,
                message: "Matrix fetched successfully",
                matrix,
            });
        } catch (error: any) {
            console.error("❌ Error in getMatrix:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}