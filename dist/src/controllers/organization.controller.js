"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFevorite = exports.getFeedbacks = exports.submitFeedback = exports.getBranchReaction = exports.reactToBranch = exports.getCitiesByState = exports.getAllStates = exports.getRecentViewsHandler = exports.createRecentViewHandler = exports.getBranchDetails = exports.getBranches = exports.getOrganizations = void 0;
const organization_service_1 = require("../services/organization.service");
const responseHandler_1 = require("../utils/responseHandler");
const getOrganizations = async (req, res) => {
    try {
        const { page, state, city, type } = req.query;
        const pageNumber = Number(page) > 0 ? Number(page) : 1;
        const result = await (0, organization_service_1.getOrganizationsService)(pageNumber, state, city, type);
        (0, responseHandler_1.successResponse)(res, result, "Organization List fetched");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.getOrganizations = getOrganizations;
const getBranches = async (req, res) => {
    try {
        const { organizationId, state, city, page } = req.query;
        const result = await (0, organization_service_1.getBranchesService)(organizationId, state, city);
        (0, responseHandler_1.successResponse)(res, result, "Branches List fetched");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.getBranches = getBranches;
const getBranchDetails = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { organizationId, branchId } = req.query;
        const branch = await (0, organization_service_1.getBranchDetailsService)(userId, organizationId, branchId);
        (0, responseHandler_1.successResponse)(res, branch, "Branche Details fetched");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.getBranchDetails = getBranchDetails;
const createRecentViewHandler = async (req, res) => {
    try {
        const userId = req.user.userId;
        const branchId = req.params.branchId;
        if (!branchId) {
            const error = new Error("Branch ID is required");
            error.status = 400;
            throw error;
        }
        const result = await (0, organization_service_1.createRecentViewService)(userId, branchId);
        (0, responseHandler_1.successResponse)(res, null, result.message);
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.createRecentViewHandler = createRecentViewHandler;
// 📌 Get Recent Views
const getRecentViewsHandler = async (req, res) => {
    try {
        const userId = req.user.userId;
        const recentViews = await (0, organization_service_1.getRecentViewsService)(userId);
        (0, responseHandler_1.successResponse)(res, recentViews, "Recent views fetched");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.getRecentViewsHandler = getRecentViewsHandler;
const getAllStates = async (req, res) => {
    try {
        const states = await (0, organization_service_1.getStates)();
        (0, responseHandler_1.successResponse)(res, states, "State data fetched");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.getAllStates = getAllStates;
const getCitiesByState = async (req, res) => {
    try {
        const stateId = req.params.stateId;
        const cities = await (0, organization_service_1.getCitiesByStateId)(stateId);
        (0, responseHandler_1.successResponse)(res, cities, "Cities data fetched");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.getCitiesByState = getCitiesByState;
const reactToBranch = async (req, res) => {
    try {
        const { reaction, isFavorite } = req.body;
        const { branchId } = req.params;
        const userId = req.user.userId;
        const updatedReaction = await (0, organization_service_1.upsertReaction)(userId, branchId, reaction, isFavorite);
        (0, responseHandler_1.successResponse)(res, updatedReaction, "Reaction updated successfully");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.reactToBranch = reactToBranch;
const getBranchReaction = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { branchId } = req.params;
        const reaction = await (0, organization_service_1.getReaction)(userId, branchId);
        (0, responseHandler_1.successResponse)(res, reaction, "Reaction fetched successfully");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.getBranchReaction = getBranchReaction;
const submitFeedback = async (req, res) => {
    try {
        const { message, anonymous } = req.body;
        const { branchId } = req.params;
        const userId = req.user.userId;
        const feedback = await (0, organization_service_1.createFeedback)(userId, branchId, message, anonymous);
        (0, responseHandler_1.successResponse)(res, feedback, "Feedback submitted successfully");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.submitFeedback = submitFeedback;
const getFeedbacks = async (req, res) => {
    try {
        const { branchId } = req.params;
        const feedbacks = await (0, organization_service_1.getBranchFeedbacks)(branchId);
        const filtered = feedbacks.map(fb => ({
            id: fb.id,
            message: fb.message,
            createdAt: fb.createdAt,
            user: fb.anonymous ? { name: 'Anonymous' } : fb.healthCardUser
        }));
        (0, responseHandler_1.successResponse)(res, filtered, "Feedback fetched successfully");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.getFeedbacks = getFeedbacks;
const getFevorite = async (req, res) => {
    try {
        const userId = req.user.userId;
        const fevorite = await (0, organization_service_1.getFavoriteBranchesService)(userId);
        (0, responseHandler_1.successResponse)(res, fevorite, "fevorite data fetched");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.getFevorite = getFevorite;
