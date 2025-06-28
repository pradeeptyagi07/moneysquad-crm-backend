"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBranchService = exports.updateBranchService = exports.getAllBranchesService = exports.createBranchService = exports.deleteOrganizationService = exports.updateOrganizationService = exports.getOrganizationsService = exports.createOrganizationService = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
const helper_1 = require("../utils/helper");
const upload_service_1 = require("./upload.service");
//Organization crud starts
const createOrganizationService = async (data, files) => {
    let s3url;
    if (files.banner?.[0]) {
        s3url = await (0, helper_1.uploadFileToS3)(files.banner?.[0], 'organizationlogo');
        data.logo = s3url;
    }
    if (typeof data.status === 'string') {
        data.status = data.status === 'true';
    }
    console.log("data", data);
    return client_1.default.organization.create({
        data,
    });
};
exports.createOrganizationService = createOrganizationService;
const getOrganizationsService = async () => {
    const organization = await client_1.default.organization.findMany({
    // include: {
    //   branches: true,
    // },
    });
    return (0, helper_1.safeJson)(organization);
};
exports.getOrganizationsService = getOrganizationsService;
const updateOrganizationService = async (id, data, files) => {
    const existingOrganization = await client_1.default.organization.findUnique({
        where: { id },
        select: { logo: true },
    });
    if (files.banner?.[0]) {
        if (existingOrganization?.logo) {
            // ✅ Delete the old avatar from S3
            await (0, upload_service_1.deleteFileFromS3)(existingOrganization.logo);
        }
        data.logo = await (0, helper_1.uploadFileToS3)(files.banner?.[0], 'organizationlogo');
    }
    if (typeof data.status === 'string') {
        data.status = data.status === 'true';
    }
    return client_1.default.organization.update({
        where: { id },
        data,
    });
};
exports.updateOrganizationService = updateOrganizationService;
const deleteOrganizationService = async (id) => {
    return client_1.default.organization.delete({
        where: { id },
    });
};
exports.deleteOrganizationService = deleteOrganizationService;
//Organization crud finished
//Branch crud starts
const createBranchService = async (organizationId, data) => {
    if (typeof data.status === 'string') {
        data.status = data.status === 'true';
    }
    const branch = await client_1.default.branch.create({
        data: {
            ...data,
            organizationId,
        },
    });
    return (0, helper_1.safeJson)(branch);
};
exports.createBranchService = createBranchService;
const getAllBranchesService = async (orgId) => {
    const whereCondition = orgId ? { organizationId: orgId } : {};
    const branches = await client_1.default.branch.findMany({
        where: whereCondition,
        include: {
            organization: true,
        },
    });
    return (0, helper_1.safeJson)(branches);
};
exports.getAllBranchesService = getAllBranchesService;
const updateBranchService = async (id, data) => {
    if (typeof data.status === 'string') {
        data.status = data.status === 'true';
    }
    const branch = await client_1.default.branch.update({
        where: { id },
        data,
    });
    return (0, helper_1.safeJson)(branch);
};
exports.updateBranchService = updateBranchService;
const deleteBranchService = async (id) => {
    return client_1.default.branch.delete({
        where: { id },
    });
};
exports.deleteBranchService = deleteBranchService;
//Branch crud finished
