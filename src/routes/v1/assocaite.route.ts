import express from "express";
import { associateController } from "../../controllers/user/associate.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import upload from "../../utils/multer";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);
router.use(upload.none());

// Create Associate
router.post("/create", associateController.create);

// Get All Associates (of the partner)
router.get("/", associateController.getAll);

// Get Associate by ID
router.get("/:id", associateController.getById);

// Update Associate
router.put("/update/:id", associateController.update);

// Delete Associate
router.delete("/delete/:id", associateController.delete);

export default router;
