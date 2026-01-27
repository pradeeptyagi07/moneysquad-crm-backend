import { Request, Response } from "express";
import { userSchema } from "../../validation/user.validation";
import { adminService } from "../../services/user/admin.service";


export const adminController = {
    createAdmin: async (req: Request, res: Response) => {
        try {
            const validated = userSchema.parse(req.body);
            const admin = await adminService.createAdmin(validated);
            res.status(201).json({ success: true, data: admin });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    getAllAdmins: async (_req: Request, res: Response) => {
        try {
            const admins = await adminService.getAllAdmins();
            res.status(200).json({ success: true, data: admins });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getAdminById: async (req: Request, res: Response) => {
        try {
            const admin = await adminService.getAdminById(req.params.id);
            //if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });
            res.status(200).json({ success: true, data: admin });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    updateAdmin: async (req: Request, res: Response) => {
        try {
            const validated = userSchema.partial().parse(req.body);
            const updated = await adminService.updateAdmin(req.params.id, validated);
            //if (!updated) return res.status(404).json({ success: false, message: "Admin not found" });
            res.status(200).json({ success: true, data: updated });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    deleteAdmin: async (req: Request, res: Response) => {
        try {
            const deleted = await adminService.deleteAdmin(req.params.id);
            //if (!deleted) return res.status(404).json({ success: false, message: "Admin not found" });
            res.status(200).json({ success: true, message: "Admin deleted" });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    },
};
