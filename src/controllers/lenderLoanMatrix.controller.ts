
import { Request, Response } from "express";
import { lenderLoanMatrixService } from "../services/lenderLoanMatrix.service";


export const lenderLoanMatrixController = {
    async getMatrix(req: Request, res: Response) {
        try {
            const matrix = await lenderLoanMatrixService.getFullMatrix();
            res.status(200).json({ success: true, data: matrix });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async toggleMapping(req: Request, res: Response) {
        try {
            let parsed = JSON.parse(req.body.data);

            // Normalize to array
            const toggleArray = Array.isArray(parsed) ? parsed : [parsed];

            console.log("array", toggleArray)

            const result = await lenderLoanMatrixService.toggleMultiple(toggleArray);

            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async getLendersByLoanType(req: Request, res: Response) {
        try {
            const { loanTypeId } = req.params;
            const lenders = await lenderLoanMatrixService.getLendersForLoanType(loanTypeId);
            res.status(200).json({ success: true, data: lenders });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
};
