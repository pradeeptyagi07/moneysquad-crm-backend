"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeJson = exports.generateUniqueCardNumber = exports.uploadFileToS3 = exports.generateOTP = void 0;
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const upload_service_1 = require("../services/upload.service");
const client_1 = __importDefault(require("../../prisma/client"));
const generateOTP = () => {
    const otp = crypto_1.default.randomInt(1000, 9999);
    return otp;
};
exports.generateOTP = generateOTP;
const uploadFileToS3 = async (file, folder) => {
    return await (0, upload_service_1.uploadToS3)(file.buffer, path_1.default.basename(file.originalname), folder);
};
exports.uploadFileToS3 = uploadFileToS3;
/**
 * Generates a unique 16-character alphanumeric card number
 */
const generateUniqueCardNumber = async () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let isUnique = false;
    let cardNumber = "";
    while (!isUnique) {
        // Generate a 16-character alphanumeric card number
        const randomPart = Array.from({ length: 10 }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join("");
        cardNumber = `AIMYM${randomPart}`;
        // Check if it already exists
        const existingCard = await client_1.default.card.findFirst({
            where: { card_number: cardNumber },
        });
        if (!existingCard) {
            isUnique = true;
        }
    }
    return cardNumber;
};
exports.generateUniqueCardNumber = generateUniqueCardNumber;
const safeJson = (obj) => {
    return JSON.parse(JSON.stringify(obj, (_, value) => typeof value === 'bigint' ? Number(value) : value));
};
exports.safeJson = safeJson;
