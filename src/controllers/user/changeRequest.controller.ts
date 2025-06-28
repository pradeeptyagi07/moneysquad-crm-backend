import { Request, Response } from "express";
import { changeRequestService } from "../../services/user/changeRequest.service";

export const changeRequestController = {
    async createRequest(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const { requestType, previousData, currentData, reason } = req.body;
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const parsedPrev = JSON.parse(previousData);

            let parsedCurrent = {};

            if (currentData && currentData !== "undefined") {
                parsedCurrent = JSON.parse(currentData);
            }

            const request = await changeRequestService.createRequest(
                userId,
                requestType,
                parsedPrev,
                parsedCurrent,
                reason,
                files
            );

            res.status(201).json({ success: true, message: "Request created", data: request });
        } catch (err: any) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async getRequestsForAdmin(req: Request, res: Response) {
        try {
            const { partnerId } = req.params;
            const requests = await changeRequestService.getPendingRequestsForAdmin(partnerId);
            res.status(200).json({ success: true, data: requests });
        } catch (err: any) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async getRequestsForPartner(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const requests = await changeRequestService.getAllRequestsForPartner(userId);
            res.status(200).json({ success: true, data: requests });
        } catch (err: any) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async updateRequestStatus(req: Request, res: Response) {
        try {
            const { requestId } = req.params;
            const { status, message } = req.body;
            const result = await changeRequestService.updateStatus(requestId, status, message);
            res.status(200).json({ success: true, message: `Request ${status}`, data: result });
        } catch (err: any) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};
