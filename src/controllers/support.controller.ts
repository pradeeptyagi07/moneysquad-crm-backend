import { Request, Response } from "express";
import { supportService } from "../services/support.service";
import { successResponse, errorResponse } from "../utils/responseHandler";
import { unflattenObject } from "../utils/helper";

export const supportController = {
    async getSupportInfo(req: Request, res: Response) {
        try {
            const info = await supportService.getSupportInfo();
            successResponse(res, info, "Support info fetched");
        } catch (err: any) {
            errorResponse(res, err);
        }
    },

    async updateSupportInfo(req: Request, res: Response) {
        try {
            //const updateData = unflattenObject(req.body);
            const updateData = req.body;
            const updated = await supportService.updateSupportInfo(updateData);
            successResponse(res, updated, "Support info updated");
        } catch (err: any) {
            errorResponse(res, err);
        }
    },
};
