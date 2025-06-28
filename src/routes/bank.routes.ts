import express from "express";
import { bankController } from "../controllers/bank.controller";

const router = express.Router();

router.post("/", bankController.createBanks);
router.get("/", bankController.getAll);
router.put("/:id", bankController.update);
router.delete("/:id", bankController.remove);

export default router;
