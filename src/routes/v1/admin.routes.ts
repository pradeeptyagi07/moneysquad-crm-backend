import express from "express";
import { adminController } from "../../controllers/user/admin.controller";

const router = express.Router();

router.post("/", adminController.createAdmin as any);
router.get("/", adminController.getAllAdmins as any);
router.get("/:id", adminController.getAdminById as any);
router.put("/:id", adminController.updateAdmin as any);
router.delete("/:id", adminController.deleteAdmin as any);

export default router;