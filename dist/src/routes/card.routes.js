"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const card_controller_1 = require("../controllers/card.controller");
const router = express_1.default.Router();
router.post("/create", auth_middleware_1.authMiddleware, card_controller_1.createCardHandler);
router.get("/download/:cardId", auth_middleware_1.authMiddleware, card_controller_1.getUserCardsHandler);
exports.default = router;
