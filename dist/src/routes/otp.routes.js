"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const otp_controller_1 = require("../controllers/otp.controller");
const router = express_1.default.Router();
router.post("/send-otp", otp_controller_1.sendOtpHandler);
router.post("/verify-otp", otp_controller_1.verifyOtpHandler);
exports.default = router;
