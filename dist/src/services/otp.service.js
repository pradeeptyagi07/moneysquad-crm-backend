"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTP = exports.saveOTPLogin = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = __importDefault(require("../../prisma/client"));
const jwt_1 = require("../utils/jwt");
dotenv_1.default.config();
const saveOTPLogin = async (phoneNumber, isLogin, type, otp) => {
    const userData = await client_1.default.userLogin.findFirst({ where: { phoneNumber } });
    if (isLogin) {
        //login flow
        if (!userData) {
            const error = new Error("Phone number is not registered.");
            error.status = 404; // HTTP 404 Not Found
            throw error;
        }
        else {
            if (type === 'aimym') {
                if (userData.aimymMemberId === null) {
                    const error = new Error("Phone number is not registered as aimym member.");
                    error.status = 404; // HTTP 404 Not Found
                    throw error;
                }
            }
            if (type === 'healthcard') {
                if (userData.healthCardUserId === null) {
                    const error = new Error("Phone number is not registered as health card user.");
                    error.status = 404; // HTTP 404 Not Found
                    throw error;
                }
            }
        }
    }
    else {
        //sign up flow
        if (userData) {
            if (type === 'aimym') {
                if (userData.aimymMemberId) {
                    const error = new Error("Phone number is already registered as Aimym member.");
                    error.status = 409; // HTTP 409 Conflict
                    throw error;
                }
            }
            if (type === 'healthcard') {
                if (userData.healthCardUserId) {
                    const error = new Error("Phone number is already registered as health card user.");
                    error.status = 409; // HTTP 409 Conflict
                    throw error;
                }
            }
        }
    }
    await client_1.default.oTP.deleteMany({ where: { phoneNumber } });
    const otpData = await client_1.default.oTP.create({
        data: {
            phoneNumber,
            otp,
            createdAt: new Date(),
        }
    });
    // Send OTP via MSG91
    try {
        await sendSMS(phoneNumber, otp);
    }
    catch (error) {
        const err = new Error("Failed to send OTP. Please try again.");
        err.status = 500;
        throw err;
    }
};
exports.saveOTPLogin = saveOTPLogin;
const verifyOTP = async (phoneNumber, isLogin, otp) => {
    const otpRecord = await client_1.default.oTP.findFirst({
        where: { phoneNumber, otp },
        orderBy: { createdAt: "desc" },
    });
    if (!otpRecord) {
        const error = new Error("Invalid OTP or OTP expired.");
        error.status = 400;
        throw error;
    }
    let token = null;
    let user = null;
    if (isLogin) {
        //login flow
        user = await client_1.default.userLogin.findFirst({ where: { phoneNumber } });
        if (!user) {
            const error = new Error("User not found.");
            error.status = 404;
            throw error;
        }
        token = (0, jwt_1.generateToken)(user.id);
    }
    // Delete the OTP after successful verification
    await client_1.default.oTP.deleteMany({ where: { phoneNumber } });
    // Generate JWT token
    return { user, token };
};
exports.verifyOTP = verifyOTP;
const sendSMS = async (phone, otp) => {
    try {
        const msgMobile = `+91${phone}`;
        const msgOtp = otp.toString();
        const response = await axios_1.default.post('https://control.msg91.com/api/v5/flow/', {
            template_id: process.env.MSG91_TEMPLATE_ID,
            sender: process.env.MSG91_SENDER_ID,
            mobiles: msgMobile,
            otp: msgOtp,
            app: "AIMYM",
        }, {
            headers: {
                'Content-Type': 'application/json',
                'authkey': process.env.MSG91_AUTH_KEY,
            }
        });
        console.log('OTP sent successfully:', msgMobile, msgOtp);
    }
    catch (error) {
        console.log(error);
    }
};
// const sendSMS = async (phone: string, otp: number) => {
//     const authKey = process.env.SMS_AUTH_KEY;
//     const senderId = process.env.SMS_SENDER_ID;
//     const routeId = process.env.SMS_ROUTE_ID || '1';
//     const message = `Your OTP is ${otp}`;
//     const postData = {
//         mobileNumbers: `91${phone}`,
//         smsContent: message,
//         senderId: senderId,
//         routeId: routeId,
//         smsContentType: 'english'
//     };
//     const url = `http://msg.msgclub.net/rest/services/sendSMS/sendGroupSms?AUTH_KEY=${authKey}`;
//     try {
//         const response = await axios.post(url, postData, {
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//         });
//         console.log("SMS sent via POST:", response.data);
//     } catch (error: any) {
//         console.error("Failed to send OTP via POST", error.message);
//         throw new Error("Failed to send OTP via SMS.");
//     }
// };
