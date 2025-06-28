import express from "express";
import { lenderLoanMatrixController } from "../../controllers/lenderLoanMatrix.controller";
import upload from "../../utils/multer";

const router = express.Router();

router.get("/", upload.none(), lenderLoanMatrixController.getMatrix);
router.patch("/toggle", upload.none(), lenderLoanMatrixController.toggleMapping);
router.get("/lenders/:loanTypeId", lenderLoanMatrixController.getLendersByLoanType);

export default router;