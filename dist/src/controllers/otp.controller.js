"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtpHandler = exports.sendOtpHandler = void 0;
const responseHandler_1 = require("../utils/responseHandler");
const helper_1 = require("../utils/helper");
const otp_service_1 = require("../services/otp.service");
const sendOtpHandler = async (req, res) => {
    try {
        const { phoneNumber, isLogin, type } = req.body;
        if (!phoneNumber) {
            const error = new Error("Phone number is required.");
            error.status = 409;
            throw error;
        }
        if (typeof phoneNumber !== "string" || phoneNumber.length !== 10) {
            const error = new Error("Invalid phone number.");
            error.status = 400;
            throw error;
        }
        const otp = (0, helper_1.generateOTP)();
        const data = await (0, otp_service_1.saveOTPLogin)(phoneNumber, isLogin, type, otp);
        (0, responseHandler_1.successResponse)(res, data, "OTP sent successfully");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.sendOtpHandler = sendOtpHandler;
const verifyOtpHandler = async (req, res) => {
    try {
        const { phoneNumber, isLogin, otp } = req.body;
        if (!phoneNumber || !otp) {
            const error = new Error("Phone number and OTP are required");
            error.status = 400;
            throw error;
        }
        const data = await (0, otp_service_1.verifyOTP)(phoneNumber, isLogin, otp);
        (0, responseHandler_1.successResponse)(res, data, "OTP verified successfully");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.verifyOtpHandler = verifyOtpHandler;
