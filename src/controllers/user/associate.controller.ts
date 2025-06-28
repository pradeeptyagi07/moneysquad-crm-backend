import { Request, Response } from "express";
import { associateService } from "../../services/user/assocaite.service";


export const associateController = {
    create: async (req: Request, res: Response) => {
        try {
            const partnerId = (req as any).user.userId;
            const associate = await associateService.createAssociate(partnerId, req.body);
            res.status(201).json({ success: true, data: associate });
        } catch (error) {
            console.error("Create Associate Error:", error);
            res.status(500).json({ success: false, message: "Failed to create associate" });
        }
    },

    getAll: async (req: Request, res: Response) => {
        try {
            const partnerId = (req as any).user.userId;
            const associates = await associateService.getAssociates(partnerId);
            res.status(200).json({ success: true, data: associates });
        } catch (error) {
            console.error("Get Associates Error:", error);
            res.status(500).json({ success: false, message: "Failed to fetch associates" });
        }
    },

    getById: async (req: Request, res: Response) => {
        try {
            const partnerId = (req as any).user.userId;
            const { id } = req.params;
            const associate = await associateService.getAssociateById(partnerId, id);
            res.status(200).json({ success: true, data: associate });
        } catch (error) {
            console.error("Get Associate by ID Error:", error);
            res.status(500).json({ success: false, message: "Failed to fetch associate" });
        }
    },

    update: async (req: Request, res: Response) => {
        try {
            const partnerId = (req as any).user.userId;
            const { id } = req.params;
            const updated = await associateService.updateAssociate(partnerId, id, req.body);
            res.status(200).json({ success: true, data: updated });
        } catch (error) {
            console.error("Update Associate Error:", error);
            res.status(500).json({ success: false, message: "Failed to update associate" });
        }
    },

    delete: async (req: Request, res: Response) => {
        try {
            const partnerId = (req as any).user.userId;
            const { id } = req.params;
            const deleted = await associateService.deleteAssociate(partnerId, id);
            res.status(200).json({ success: true, message: "Associate deleted successfully" });
        } catch (error) {
            console.error("Delete Associate Error:", error);
            res.status(500).json({ success: false, message: "Failed to delete associate" });
        }
    },
};
