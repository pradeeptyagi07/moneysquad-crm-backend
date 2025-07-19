import { Request, Response } from "express";
import { leadService } from "../../services/user/lead.service";
import { unflattenObject } from "../../utils/helper";
import { assignManagerSchema, createLeadSchema, editLeadSchema, updateLeadStatusSchema } from "../../validation/lead.schema";
import { createDisbursedFormSchema } from "../../validation/disbursedForm.schema";

export const leadController = {

    async createLead(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const formData = unflattenObject(req.body);
            const validation = createLeadSchema.safeParse(formData);
            if (!validation.success) {
                console.log("❌ Zod validation error:");
                console.dir(validation.error.format(), { depth: null }); // ✅ Best for debugging nested objects
                console.log("a", validation.error.flatten())
            }
            const leadData = validation.data;
            console.log("lead", leadData);
            const createdLead = await leadService.createLead(userId, leadData);
            res.status(201).json({ success: true, data: createdLead });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    editLead: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.userId;
            const { id } = req.params;
            const formData = unflattenObject(req.body);
            const validation = editLeadSchema.safeParse(formData);

            const updatedLead = await leadService.editLead(userId, id, validation.data);
            res.status(200).json({ success: true, lead: updatedLead });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async duplicateLead(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const formData = unflattenObject(req.body);
            const validation = createLeadSchema.safeParse(formData);
            const leadData = validation.data;
            const result = await leadService.createDuplicateLead(userId, leadData);
            res.status(201).json({ success: true, data: result });

        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    },


    async getLeadById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const lead = await leadService.getLeadById(id);
            res.status(200).json({ success: true, data: lead });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async getAllLeads(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const leads = await leadService.getAllLeads(userId);
            res.status(200).json({ success: true, data: leads });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },


    async timeLine(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const createdLead = await leadService.getTimeLine(id);
            res.status(201).json({ success: true, data: createdLead });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async createRemarksById(req: Request, res: Response){
        try {
             const { id } = req.query as { id: string };
             const { message } = req.body; 
             const userId = (req as any).user.userId;
             const createRemarks = await leadService.addRemark(id, message,userId);
             res.status(201).json({ success: true, data: createRemarks });
        } 
        catch (error: any) {
            
           res.status(500).json({ success: false, message: error.message });
        }
    },
    async getRemarksByLeadId(req: Request, res: Response){
        try {
            const { id } = req.params;
            const remarks = await leadService.getRemarks(id);
            res.status(200).json({ success: true, data: remarks });
        } 
        catch (error: any) {
            
           res.status(500).json({ success: false, message: error.message });
        }
    },

    assignManager: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const userId = (req as any).user.userId;
            const validation = assignManagerSchema.safeParse(req.body);
            const updatedLead = await leadService.assignManagerToLead(id, userId, validation.data);
            res.status(200).json({ success: true, lead: updatedLead });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    },


    updateLeadStatus: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const userId = (req as any).user.userId;
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const validation = updateLeadStatusSchema.safeParse(req.body);

            const result = await leadService.updateLeadStatus(id, userId, validation.data, files);

            res.status(200).json({ success: true, message: "Status updated successfully", data: result });
        } catch (error: any) {
            console.error("Error in updateLeadStatus:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    deleteLead: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await leadService.deleteLead(id);
            res.status(200).json({ success: true, message: "Lead deleted successfully" });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    createDisbursedController: async (req: Request, res: Response) => {

        try {
            const { id } = req.params;
            const result = createDisbursedFormSchema.safeParse(req.body);
            const form = await leadService.createDisbursed(id, result.data);
            res.status(201).json({ success: true, form });
        } catch (err: any) {
            res.status(400).json({ success: false, message: err.message });
        }
    },

    updateDisbursedController: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = createDisbursedFormSchema.safeParse(req.body);
            const updatedForm = await leadService.updateDisbursed(id, result.data);
            res.status(200).json({ success: true, form: updatedForm });
        } catch (err: any) {
            res.status(400).json({ success: false, message: err.message });
        }
    },

};
