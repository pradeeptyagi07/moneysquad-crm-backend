import { Request, Response } from "express";
import { bankService } from "../services/bank.service";

export const bankController = {
    async createBanks(req: Request, res: Response) {
        try {
            const banks = req.body;
            const data = await bankService.createBanks(banks);
            res.status(201).json({ success: true, message: 'Banks created', data });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async getAll(req: Request, res: Response) {
        try {
            const banks = await bankService.getAllBanks();
            res.status(200).json({ success: true, data: banks });
        } catch (err: any) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const bank = await bankService.updateBank(id, name);
            res.status(200).json({ success: true, message: "Bank updated", data: bank });
        } catch (err: any) {
            res.status(400).json({ success: false, message: err.message });
        }
    },

    async remove(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const bank = await bankService.deleteBank(id);
            res.status(200).json({ success: true, message: "Bank deleted", data: bank });
        } catch (err: any) {
            res.status(400).json({ success: false, message: err.message });
        }
    }
};