"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserCardsHandler = exports.createCardHandler = void 0;
const responseHandler_1 = require("../utils/responseHandler");
const card_service_1 = require("../services/card.service");
const createCardHandler = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { issueDate, validUpto, transaction_id } = req.body;
        if (!issueDate || !validUpto) {
            const error = new Error("All fields are required");
            error.status = 400;
            throw error;
        }
        const newCard = await (0, card_service_1.createCard)(userId, new Date(issueDate), new Date(validUpto), transaction_id);
        (0, responseHandler_1.successResponse)(res, newCard, "Card created successfully");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.createCardHandler = createCardHandler;
const getUserCardsHandler = async (req, res) => {
    try {
        const userId = req.user.id;
        const cardId = req.params.cardId;
        const userCards = await (0, card_service_1.getUserCards)(cardId);
        (0, responseHandler_1.successResponse)(res, userCards, "Card fetched successfully");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.getUserCardsHandler = getUserCardsHandler;
