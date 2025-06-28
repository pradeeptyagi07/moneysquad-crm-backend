"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTransaction = exports.createTransaction = void 0;
const transaction_service_1 = require("../services/transaction.service");
const responseHandler_1 = require("../utils/responseHandler");
const createTransaction = async (req, res) => {
    try {
        const userId = req.user.userId;
        const transaction = await (0, transaction_service_1.createTransactionService)(req.body, userId);
        (0, responseHandler_1.successResponse)(res, transaction, "Transaction created");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.createTransaction = createTransaction;
const updateTransaction = async (req, res) => {
    try {
        const userId = req.user.userId;
        const transactionId = req.params.transactionId;
        const updatedTransaction = await (0, transaction_service_1.updateTransactionService)(transactionId, req.body);
        (0, responseHandler_1.successResponse)(res, updatedTransaction, "Transaction updated");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.updateTransaction = updateTransaction;
