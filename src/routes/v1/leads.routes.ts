import express from "express";
import { leadController } from "../../controllers/user/lead.controller";
import upload from "../../utils/multer";
import { authMiddleware } from "../../middleware/auth.middleware";


const router = express.Router();

router.get("/archived", authMiddleware, leadController.getAllArchivedLeads);
router.post("/create", authMiddleware, upload.none(), leadController.createLead);
router.put("/update/:id", upload.none(), authMiddleware, leadController.editLead);
router.post("/duplicate", authMiddleware, upload.none(), leadController.duplicateLead);
router.get("/:id", leadController.getLeadById);
router.get("/", authMiddleware, leadController.getAllLeads);
router.delete("/delete/:id", leadController.deleteLead);

router.post("/disbursed/:id", upload.none(), leadController.createDisbursedController);
router.put("/disbursed/:id", authMiddleware, upload.none(), leadController.updateDisbursedController);


router.put("/assign-manager/:id", upload.none(), authMiddleware, leadController.assignManager);
router.put("/update-status/:id", upload.fields([{name: 'rejectImage', maxCount: 1}]), authMiddleware, leadController.updateLeadStatus);


router.get("/timeline/:id", leadController.timeLine);


router.get('/remarks/:id', leadController.getRemarksByLeadId);
router.post("/create-remarks", authMiddleware, upload.none(), leadController.createRemarksById);




export default router;