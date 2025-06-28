"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTransactionService = exports.createTransactionService = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
const createTransactionService = async (data, userId) => {
    const { razorpay_key, amount, status, totalMembers } = data;
    console.log("data", data);
    return await client_1.default.transaction.create({
        data: {
            userId,
            razorpay_key,
            amount,
            status,
            totalMembers,
        },
    });
};
exports.createTransactionService = createTransactionService;
const updateTransactionService = async (transactionId, data) => {
    return await client_1.default.transaction.update({
        where: { id: transactionId },
        data,
    });
};
exports.updateTransactionService = updateTransactionService;
