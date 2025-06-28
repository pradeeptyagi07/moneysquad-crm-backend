
import { Request, Response } from "express";
import { commissionService } from "../services/commision.service";


export const commissionController = {
    async getAllCommissions(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const data = await commissionService.getAllCommissions(userId);
            res.status(200).json({
                success: true,
                message: "Commission data fetched successfully",
                data,
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async updateCommissionEntry(req: Request, res: Response) {
        try {
            const { commissionId, sheetType, entryId } = req.params;
            const { termLoan, overdraft, lenderName, remark } = req.body;

            console.log("termLoan", termLoan);

            const updated = await commissionService.updateCommissionEntry(
                commissionId,
                sheetType,
                entryId,
                {
                    termLoan: termLoan !== undefined ? parseFloat(termLoan) : undefined,
                    overdraft: overdraft !== undefined ? parseFloat(overdraft) : undefined,
                    lenderName,
                    remark,
                }
            );

            res.status(200).json({
                success: true,
                message: "Entry updated successfully.",
                data: updated,
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async getAllPayouts(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const payouts = await commissionService.getAllPayouts(userId);
            res.status(200).json({
                success: true,
                message: "Partner payouts fetched successfully",
                data: payouts,
            });
        } catch (error: any) {
            console.error("Error fetching partner payouts:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch payouts",
            });
        }
    },

    async editPayout(req: Request, res: Response) {
        try {
            const { payoutId } = req.params;
            const { commission, payoutStatus, remark } = req.body;

            const updated = await commissionService.editPayout(payoutId, {
                commission,
                payoutStatus,
                remark
            });

            res.status(200).json({
                success: true,
                message: "Payout updated successfully",
                data: updated,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Failed to update payout",
            });
        }

    },

    async getPartnerPayoutSummary(req: Request, res: Response) {
        try {
            const month = req.query.month as string;
            const year = req.query.year as string;

            const data = await commissionService.getPartnerMonthlySummary(parseInt(month), parseInt(year));
            res.status(200).json({ success: true, message: "Monthly summary fetched successfully", data });
        } catch (error: any) {
            console.error("Error in monthly summary:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    },


    async getPayoutDetails(req: Request, res: Response) {
        try {
            const { payoutId } = req.params;
            const details = await commissionService.getPayoutDetailsById(payoutId);

            res.status(200).json({
                success: true,
                message: "Payout details fetched successfully",
                data: details,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch payout details",
            });
        }
    },

    async editPartnerMeta(req: Request, res: Response) {
        try {
            const { partnerId, month, year, gstStatus, advancesPaid } = req.body;

            const meta = await commissionService.editPartnerMeta({
                partnerId,
                month: parseInt(month),
                year: parseInt(year),
                gstStatus,
                advancesPaid,
            });

            res.status(200).json({
                success: true,
                message: "Partner payout meta updated successfully",
                data: meta,
            });
        } catch (error: any) {
            console.error("Error in editPartnerMeta:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async getPartnerMonthlyBreakdown(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const breakdown = await commissionService.getPartnerMonthlyBreakdown(userId);

            res.status(200).json({
                success: true,
                message: "Monthly breakdown fetched successfully",
                data: breakdown,
            });
        } catch (error: any) {
            console.error("Error in getPartnerMonthlyBreakdown:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

};