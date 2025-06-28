"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBranchByAdmin = exports.updateBranchByAdmin = exports.getAllBranchesByAdmin = exports.createBranchByAdmin = exports.deleteOrganizationByAdmin = exports.updateOrganizationByAdmin = exports.getOrganizationsByAdmin = exports.createOrganizationByAdmin = void 0;
const responseHandler_1 = require("../utils/responseHandler");
const admin_service_1 = require("../services/admin.service");
const createOrganizationByAdmin = async (req, res) => {
    try {
        console.log(req.body);
        const files = req.files;
        const org = await (0, admin_service_1.createOrganizationService)(req.body, files);
        (0, responseHandler_1.successResponse)(res, org, 'Organization created successfully');
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.createOrganizationByAdmin = createOrganizationByAdmin;
const getOrganizationsByAdmin = async (_req, res) => {
    try {
        const orgs = await (0, admin_service_1.getOrganizationsService)();
        (0, responseHandler_1.successResponse)(res, orgs, 'Organizations fetched successfully');
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.getOrganizationsByAdmin = getOrganizationsByAdmin;
const updateOrganizationByAdmin = async (req, res) => {
    try {
        const files = req.files;
        const org = await (0, admin_service_1.updateOrganizationService)(req.params.id, req.body, files);
        (0, responseHandler_1.successResponse)(res, org, 'Organization updated successfully');
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.updateOrganizationByAdmin = updateOrganizationByAdmin;
const deleteOrganizationByAdmin = async (req, res) => {
    try {
        await (0, admin_service_1.deleteOrganizationService)(req.params.id);
        (0, responseHandler_1.successResponse)(res, null, 'Organization deleted successfully');
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.deleteOrganizationByAdmin = deleteOrganizationByAdmin;
const createBranchByAdmin = async (req, res) => {
    try {
        const organizationId = req.params.orgId;
        const branch = await (0, admin_service_1.createBranchService)(organizationId, req.body);
        (0, responseHandler_1.successResponse)(res, branch, 'Branch created successfully');
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.createBranchByAdmin = createBranchByAdmin;
const getAllBranchesByAdmin = async (req, res) => {
    try {
        const organizationId = req.params.orgId;
        const branches = await (0, admin_service_1.getAllBranchesService)(organizationId);
        (0, responseHandler_1.successResponse)(res, branches, 'Branches fetched successfully');
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.getAllBranchesByAdmin = getAllBranchesByAdmin;
const updateBranchByAdmin = async (req, res) => {
    try {
        const updated = await (0, admin_service_1.updateBranchService)(req.params.id, req.body);
        (0, responseHandler_1.successResponse)(res, updated, 'Branch updated successfully');
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.updateBranchByAdmin = updateBranchByAdmin;
const deleteBranchByAdmin = async (req, res) => {
    try {
        await (0, admin_service_1.deleteBranchService)(req.params.id);
        (0, responseHandler_1.successResponse)(res, null, 'Branch deleted successfully');
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.deleteBranchByAdmin = deleteBranchByAdmin;
