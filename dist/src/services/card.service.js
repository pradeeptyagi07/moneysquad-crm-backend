"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserCards = exports.createCard = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
const helper_1 = require("../utils/helper");
/**
 * Create a new Card
 */
const createCard = async (userId, issueDate, validUpto, transaction_id) => {
    const mainUser = await client_1.default.healthCardUser.findUnique({
        where: { id: userId },
    });
    if (!mainUser) {
        const error = new Error("User not found");
        error.status = 404;
        throw error;
    }
    let familyMembers = [];
    if (mainUser.familyId) {
        // Find all users in the same family (excluding the main user)
        familyMembers = await client_1.default.healthCardUser.findMany({
            where: { familyId: mainUser.familyId, id: { not: userId } },
        });
    }
    const usersToCreateCardsFor = [mainUser, ...familyMembers];
    try {
        // Generate unique card numbers and create cards for each user
        const createdCards = await Promise.all(usersToCreateCardsFor.map(async (member) => {
            const card_number = await (0, helper_1.generateUniqueCardNumber)();
            const createdCard = await client_1.default.card.create({
                data: {
                    userId: member.id,
                    issueDate,
                    validUpto,
                    card_number,
                    transaction_id,
                },
            });
            // Update the User table with the created cardId
            await client_1.default.healthCardUser.update({
                where: { id: member.id },
                data: { cardId: createdCard.id },
            });
            return createdCard;
        }));
        return createdCards;
    }
    catch (error) {
        error.status = 500;
        throw error;
    }
};
exports.createCard = createCard;
/**
 * Get All Cards for a User
 */
const getUserCards = async (cardId) => {
    return client_1.default.card.findMany({
        where: { id: cardId },
        select: {
            id: true,
            userId: true,
            issueDate: true,
            validUpto: true,
            card_number: true
        }
    });
};
exports.getUserCards = getUserCards;
