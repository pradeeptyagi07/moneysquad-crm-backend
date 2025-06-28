"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.deleteUserHandler = exports.deleteFamilyHandler = exports.updateFamilyMember = exports.updateUserHandler = exports.getFamilyHandler = exports.getUserHandler = exports.registerFamilyMember = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
const responseHandler_1 = require("../utils/responseHandler");
const register = async (req, res) => {
    try {
        const files = req.files;
        const { user, token } = await (0, auth_service_1.registerUser)(req.body, files);
        (0, responseHandler_1.successResponse)(res, { user, token }, "User registered successfully");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.register = register;
const registerFamilyMember = async (req, res) => {
    try {
        const userId = req.user.userId;
        const files = req.files;
        const { user } = await (0, auth_service_1.registerUser)(req.body, files, userId);
        (0, responseHandler_1.successResponse)(res, user, "User registered successfully");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.registerFamilyMember = registerFamilyMember;
const getUserHandler = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { user } = await (0, auth_service_1.getUserService)(userId);
        (0, responseHandler_1.successResponse)(res, user, "User info fetched");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.getUserHandler = getUserHandler;
const getFamilyHandler = async (req, res) => {
    try {
        const userId = req.user.userId;
        const familyMember = await (0, auth_service_1.getFamilyService)(userId);
        (0, responseHandler_1.successResponse)(res, familyMember, "family member fetched");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.getFamilyHandler = getFamilyHandler;
const updateUserHandler = async (req, res) => {
    try {
        const userId = req.user.userId;
        const files = req.files;
        const updateUser = await (0, auth_service_1.updateUserService)(userId, files, req.body);
        (0, responseHandler_1.successResponse)(res, updateUser, "User Updated");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.updateUserHandler = updateUserHandler;
const updateFamilyMember = async (req, res) => {
    try {
        const familyMemberId = req.params.memberId;
        const files = req.files;
        const updateUser = await (0, auth_service_1.updateUserService)(familyMemberId, files, req.body);
        (0, responseHandler_1.successResponse)(res, updateUser, "User Updated");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.updateFamilyMember = updateFamilyMember;
const deleteFamilyHandler = async (req, res) => {
    try {
        const userId = req.user.userId;
        const familyMemberId = req.params.memberId;
        const familyMember = await (0, auth_service_1.deleteFamilyMemberService)(userId, familyMemberId);
        (0, responseHandler_1.successResponse)(res, "family member deleted");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.deleteFamilyHandler = deleteFamilyHandler;
// export const deleteUserByPhoneHandler = async (req: Request, res: Response) => {
//     try {
//         const { phoneNumber } = req.params;
//         const deletedUser = await deleteUserByPhoneService(phoneNumber);
//         successResponse(res, null, "User and all associated data deleted successfully");
//     } catch (error: any) {
//         return errorResponse(res, error);
//     }
// };
const deleteUserHandler = async (req, res) => {
    try {
        const userId = req.user.userId;
        const deletedUser = await (0, auth_service_1.deleteUser)(userId);
        (0, responseHandler_1.successResponse)(res, null, "User and all associated data deleted successfully");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.deleteUserHandler = deleteUserHandler;
const loginUser = async (req, res) => {
    try {
        const loginPayload = req.body;
        const result = await (0, auth_service_1.loginService)(loginPayload);
        (0, responseHandler_1.successResponse)(res, result, "Login successful");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.loginUser = loginUser;
