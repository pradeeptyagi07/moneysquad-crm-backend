import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import upload from "../../utils/multer";
import { changeRequestController } from "../../controllers/user/changeRequest.controller";

const router = express.Router();

router.post("/", authMiddleware, upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'panCard', maxCount: 1 },
    { name: 'aadharFront', maxCount: 1 },
    { name: 'aadharBack', maxCount: 1 },
    { name: 'cancelledCheque', maxCount: 1 },
    { name: 'gstCertificate', maxCount: 1 },
    { name: 'aditional', maxCount: 10 },
]), changeRequestController.createRequest);

router.get("/admin/:partnerId", authMiddleware, changeRequestController.getRequestsForAdmin);
router.get("/partner", authMiddleware, changeRequestController.getRequestsForPartner);
router.put("/action/:requestId", authMiddleware, upload.none(), changeRequestController.updateRequestStatus);

export default router;
