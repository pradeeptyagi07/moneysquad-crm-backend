"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWelcomeBanner = exports.updateWelcomeBanner = exports.getAllWelcomeBanners = exports.createWelcomeBanner = exports.deleteWellnessBanner = exports.updateWellnessBanner = exports.getAllWellnessBanners = exports.createWellnessBanner = exports.deleteDashboardBanner = exports.updateDashboardBanner = exports.getAllDashboardBanners = exports.createDashboardBanner = exports.deleteEventBanner = exports.updateEventBanner = exports.getAllEventBanners = exports.createEventBanner = void 0;
const banner_service_1 = require("../services/banner.service");
const responseHandler_1 = require("../utils/responseHandler");
const banner_validation_1 = require("../validations/banner.validation");
// EVENT BANNER
const createEventBanner = async (req, res) => {
    try {
        const validatedData = banner_validation_1.eventBannerSchema.parse(req.body);
        console.log(validatedData);
        const files = req.files;
        const data = await (0, banner_service_1.createEventBannerService)(validatedData, files);
        (0, responseHandler_1.successResponse)(res, data, "Event banner created");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.createEventBanner = createEventBanner;
const getAllEventBanners = async (_req, res) => {
    try {
        const data = await (0, banner_service_1.getAllEventBannersService)();
        (0, responseHandler_1.successResponse)(res, data, "Event banners fetched");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.getAllEventBanners = getAllEventBanners;
const updateEventBanner = async (req, res) => {
    try {
        const validatedData = banner_validation_1.updateEventBannerSchema.parse(req.body);
        const files = req.files;
        const data = await (0, banner_service_1.updateEventBannerService)(req.params.id, validatedData, files);
        (0, responseHandler_1.successResponse)(res, data, "Event banner updated");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.updateEventBanner = updateEventBanner;
const deleteEventBanner = async (req, res) => {
    try {
        const data = await (0, banner_service_1.deleteEventBannerService)(req.params.id);
        (0, responseHandler_1.successResponse)(res, data, "Event banner deleted");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.deleteEventBanner = deleteEventBanner;
// DASHBOARD BANNER
const createDashboardBanner = async (req, res) => {
    try {
        const validatedData = banner_validation_1.dashboardBannerSchema.parse(req.body);
        const files = req.files;
        const data = await (0, banner_service_1.createDashboardBannerService)(validatedData, files);
        (0, responseHandler_1.successResponse)(res, data, "Dashboard banner created");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.createDashboardBanner = createDashboardBanner;
const getAllDashboardBanners = async (_req, res) => {
    try {
        const data = await (0, banner_service_1.getAllDashboardBannersService)();
        (0, responseHandler_1.successResponse)(res, data, "Dashboard banners fetched");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.getAllDashboardBanners = getAllDashboardBanners;
const updateDashboardBanner = async (req, res) => {
    try {
        const validatedData = banner_validation_1.updateDashboardBannerScheema.parse(req.body);
        const files = req.files;
        const data = await (0, banner_service_1.updateDashboardBannerService)(req.params.id, validatedData, files);
        (0, responseHandler_1.successResponse)(res, data, "Dashboard banner updated");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.updateDashboardBanner = updateDashboardBanner;
const deleteDashboardBanner = async (req, res) => {
    try {
        const data = await (0, banner_service_1.deleteDashboardBannerService)(req.params.id);
        (0, responseHandler_1.successResponse)(res, data, "Dashboard banner deleted");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.deleteDashboardBanner = deleteDashboardBanner;
// WELLNESS BANNER
const createWellnessBanner = async (req, res) => {
    try {
        const validatedData = banner_validation_1.wellnessBannerSchema.parse(req.body);
        const files = req.files;
        const data = await (0, banner_service_1.createWellnessBannerService)(validatedData, files);
        (0, responseHandler_1.successResponse)(res, data, "Wellness banner created");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.createWellnessBanner = createWellnessBanner;
const getAllWellnessBanners = async (_req, res) => {
    try {
        const data = await (0, banner_service_1.getAllWellnessBannersService)();
        (0, responseHandler_1.successResponse)(res, data, "Wellness banners fetched");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.getAllWellnessBanners = getAllWellnessBanners;
const updateWellnessBanner = async (req, res) => {
    try {
        const validatedData = banner_validation_1.updateWellnessBannerSchema.parse(req.body);
        const files = req.files;
        const data = await (0, banner_service_1.updateWellnessBannerService)(req.params.id, validatedData, files);
        (0, responseHandler_1.successResponse)(res, data, "Wellness banner updated");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.updateWellnessBanner = updateWellnessBanner;
const deleteWellnessBanner = async (req, res) => {
    try {
        const data = await (0, banner_service_1.deleteWellnessBannerService)(req.params.id);
        (0, responseHandler_1.successResponse)(res, data, "Wellness banner deleted");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.deleteWellnessBanner = deleteWellnessBanner;
// WELCOME BANNER
const createWelcomeBanner = async (req, res) => {
    try {
        const validatedData = banner_validation_1.welcomeBannerSchema.parse(req.body);
        const files = req.files;
        const data = await (0, banner_service_1.createWelcomesBannerService)(validatedData, files);
        (0, responseHandler_1.successResponse)(res, data, "Wellness banner created");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.createWelcomeBanner = createWelcomeBanner;
const getAllWelcomeBanners = async (_req, res) => {
    try {
        const data = await (0, banner_service_1.getAllWellcomeBannersService)();
        (0, responseHandler_1.successResponse)(res, data, "Wellness banners fetched");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.getAllWelcomeBanners = getAllWelcomeBanners;
const updateWelcomeBanner = async (req, res) => {
    try {
        const validatedData = banner_validation_1.updateWelcomeBannerSchema.parse(req.body);
        const files = req.files;
        const data = await (0, banner_service_1.updateWellcomeBannerService)(req.params.id, validatedData, files);
        (0, responseHandler_1.successResponse)(res, data, "Wellness banner updated");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.updateWelcomeBanner = updateWelcomeBanner;
const deleteWelcomeBanner = async (req, res) => {
    try {
        const data = await (0, banner_service_1.deleteWellcomeBannerService)(req.params.id);
        (0, responseHandler_1.successResponse)(res, data, "Wellness banner deleted");
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(res, error);
    }
};
exports.deleteWelcomeBanner = deleteWelcomeBanner;
