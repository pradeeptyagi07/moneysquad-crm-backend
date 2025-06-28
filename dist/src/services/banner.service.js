"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWellcomeBannerService = exports.updateWellcomeBannerService = exports.getAllWellcomeBannersService = exports.createWelcomesBannerService = exports.deleteWellnessBannerService = exports.updateWellnessBannerService = exports.getAllWellnessBannersService = exports.createWellnessBannerService = exports.deleteDashboardBannerService = exports.updateDashboardBannerService = exports.getAllDashboardBannersService = exports.createDashboardBannerService = exports.deleteEventBannerService = exports.updateEventBannerService = exports.getAllEventBannersService = exports.createEventBannerService = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
const helper_1 = require("../utils/helper");
const upload_service_1 = require("./upload.service");
// EVENT BANNER SERVICES
const createEventBannerService = async (data, files) => {
    let s3url;
    if (files.banner?.[0]) {
        s3url = await (0, helper_1.uploadFileToS3)(files.banner?.[0], 'eventbanner');
        data.banner = s3url;
    }
    if (data.date) {
        data.date = new Date(data.date);
    }
    return client_1.default.eventBanner.create({ data });
};
exports.createEventBannerService = createEventBannerService;
const getAllEventBannersService = async () => {
    return client_1.default.eventBanner.findMany();
};
exports.getAllEventBannersService = getAllEventBannersService;
const updateEventBannerService = async (id, data, files) => {
    const existing = await client_1.default.eventBanner.findUnique({
        where: { id },
    });
    if (!existing) {
        const error = new Error("Event banner not found");
        error.status = 404;
        throw error;
    }
    if (files.banner?.[0]) {
        // Delete the old banner from S3
        if (existing.banner) {
            await (0, upload_service_1.deleteFileFromS3)(existing.banner);
        }
        // Upload the new banner
        const s3Url = await (0, helper_1.uploadFileToS3)(files.banner?.[0], 'eventbanner');
        data.banner = s3Url;
    }
    return client_1.default.eventBanner.update({
        where: { id },
        data,
    });
};
exports.updateEventBannerService = updateEventBannerService;
const deleteEventBannerService = async (id) => {
    return client_1.default.eventBanner.delete({
        where: { id },
    });
};
exports.deleteEventBannerService = deleteEventBannerService;
// DASHBOARD BANNER SERVICES
const createDashboardBannerService = async (data, files) => {
    let s3url;
    if (files.banner?.[0]) {
        s3url = await (0, helper_1.uploadFileToS3)(files.banner?.[0], 'dashboardbanner');
        data.banner = s3url;
    }
    return client_1.default.dashboardBanner.create({ data });
};
exports.createDashboardBannerService = createDashboardBannerService;
const getAllDashboardBannersService = async () => {
    return client_1.default.dashboardBanner.findMany();
};
exports.getAllDashboardBannersService = getAllDashboardBannersService;
const updateDashboardBannerService = async (id, data, files) => {
    const existing = await client_1.default.dashboardBanner.findUnique({
        where: { id },
    });
    if (!existing) {
        const error = new Error("Dashboard banner not found");
        error.status = 404;
        throw error;
    }
    if (files.banner?.[0]) {
        if (existing.banner) {
            await (0, upload_service_1.deleteFileFromS3)(existing.banner);
        }
        const s3Url = await (0, helper_1.uploadFileToS3)(files.banner?.[0], 'dashboardbanner');
        data.banner = s3Url;
    }
    return client_1.default.dashboardBanner.update({
        where: { id },
        data,
    });
};
exports.updateDashboardBannerService = updateDashboardBannerService;
const deleteDashboardBannerService = async (id) => {
    return client_1.default.dashboardBanner.delete({
        where: { id },
    });
};
exports.deleteDashboardBannerService = deleteDashboardBannerService;
// WELLNESS BANNER SERVICES
const createWellnessBannerService = async (data, files) => {
    let s3url;
    if (files.video?.[0]) {
        s3url = await (0, helper_1.uploadFileToS3)(files.video?.[0], 'wellnesVideo');
        data.video = s3url;
    }
    return client_1.default.wellnessBanner.create({ data });
};
exports.createWellnessBannerService = createWellnessBannerService;
const getAllWellnessBannersService = async () => {
    return client_1.default.wellnessBanner.findMany();
};
exports.getAllWellnessBannersService = getAllWellnessBannersService;
const updateWellnessBannerService = async (id, data, files) => {
    const existing = await client_1.default.wellnessBanner.findUnique({
        where: { id },
    });
    if (!existing) {
        const error = new Error("Wellness banner not found");
        error.status = 404;
        throw error;
    }
    if (files.video?.[0]) {
        if (existing.video) {
            await (0, upload_service_1.deleteFileFromS3)(existing.video);
        }
        const s3Url = await (0, helper_1.uploadFileToS3)(files.video?.[0], 'wellnesVideo');
        data.video = s3Url;
    }
    return client_1.default.wellnessBanner.update({
        where: { id },
        data,
    });
};
exports.updateWellnessBannerService = updateWellnessBannerService;
const deleteWellnessBannerService = async (id) => {
    return client_1.default.wellnessBanner.delete({
        where: { id },
    });
};
exports.deleteWellnessBannerService = deleteWellnessBannerService;
// WELCOME BANNER SERVICES
const createWelcomesBannerService = async (data, files) => {
    let s3url;
    if (files.image?.[0]) {
        s3url = await (0, helper_1.uploadFileToS3)(files.image?.[0], 'welcomeImage');
        data.image = s3url;
    }
    return client_1.default.wellComeBanner.create({ data });
};
exports.createWelcomesBannerService = createWelcomesBannerService;
const getAllWellcomeBannersService = async () => {
    return client_1.default.wellComeBanner.findMany();
};
exports.getAllWellcomeBannersService = getAllWellcomeBannersService;
const updateWellcomeBannerService = async (id, data, files) => {
    const existing = await client_1.default.wellComeBanner.findUnique({
        where: { id },
    });
    if (!existing) {
        const error = new Error("Welcome banner not found");
        error.status = 404;
        throw error;
    }
    if (files.image?.[0]) {
        if (existing.image) {
            await (0, upload_service_1.deleteFileFromS3)(existing.image);
        }
        const s3Url = await (0, helper_1.uploadFileToS3)(files.image?.[0], 'welcomeImage');
        data.image = s3Url;
    }
    return client_1.default.wellComeBanner.update({
        where: { id },
        data,
    });
};
exports.updateWellcomeBannerService = updateWellcomeBannerService;
const deleteWellcomeBannerService = async (id) => {
    return client_1.default.wellComeBanner.delete({
        where: { id },
    });
};
exports.deleteWellcomeBannerService = deleteWellcomeBannerService;
