import { Request, Response } from 'express';
import { productInfoService } from '../services/productInfo.service';
import { successResponse, errorResponse } from '../utils/responseHandler';

export const productInfoController = {
    async getAll(req: Request, res: Response) {
        try {
            const data = await productInfoService.getProductInfo();
            successResponse(res, data, "Fetched product info");
        } catch (err: any) {
            errorResponse(res, err);
        }
    },

    async editGuides(req: Request, res: Response) {
        try {
            const guides = req.body.guides;
            const data = await productInfoService.updateGuides(guides);
            successResponse(res, data, "Updated product guides");
        } catch (err: any) {
            errorResponse(res, err);
        }
    },

    async editPolicies(req: Request, res: Response) {
        try {
            const policies = req.body.policies;
            const data = await productInfoService.updatePolicies(policies);
            successResponse(res, data, "Updated product policies");
        } catch (err: any) {
            errorResponse(res, err);
        }
    },

    async editDocuments(req: Request, res: Response) {
        try {
            const documents = req.body.documents;
            const data = await productInfoService.updateDocuments(documents);
            successResponse(res, data, "Updated product documents");
        } catch (err: any) {
            errorResponse(res, err);
        }
    },

    async createInitial(req: Request, res: Response) {
        try {
            const data = await productInfoService.createInitialData(req.body);
            res.status(201).json({ success: true, message: "Initial data created", data });
        } catch (err: any) {
            res.status(400).json({ success: false, message: err.message });
        }
    },
};
