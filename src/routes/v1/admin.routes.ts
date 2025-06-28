import express from "express";
import { adminController } from "../../controllers/user/admin.controller";

const router = express.Router();

router.post("/", adminController.createAdmin);
router.get("/", adminController.getAllAdmins);
router.get("/:id", adminController.getAdminById);
router.put("/:id", adminController.updateAdmin);
router.delete("/:id", adminController.deleteAdmin);

export default router;