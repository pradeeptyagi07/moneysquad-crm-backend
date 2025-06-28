import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { commissionController } from "../../controllers/commision.controller";
import upload from "../../utils/multer";

const router = express.Router();
router.get("/", authMiddleware, commissionController.getAllCommissions);

router.put(
  "/entry/:commissionId/:sheetType/:entryId", upload.none(), authMiddleware,
  commissionController.updateCommissionEntry
);

router.get("/get-payout", authMiddleware, commissionController.getAllPayouts);

router.put("/edit-payout/:payoutId", authMiddleware, upload.none(), commissionController.editPayout);

router.get("/partner-summary", authMiddleware, commissionController.getPartnerPayoutSummary);

router.get("/payout-details/:payoutId", authMiddleware, commissionController.getPayoutDetails);

router.put("/partner-summary/edit", authMiddleware, upload.none(), commissionController.editPartnerMeta);

router.get("/partner-monthly-breakdown",authMiddleware,commissionController.getPartnerMonthlyBreakdown);

export default router;