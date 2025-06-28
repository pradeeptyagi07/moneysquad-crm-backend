"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("../utils/multer"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const banner_controller_1 = require("../controllers/banner.controller");
const router = express_1.default.Router();
// Event Banner Routes
router.post("/event", auth_middleware_1.authMiddleware, multer_1.default.fields([
    { name: 'banner', maxCount: 1 }
]), banner_controller_1.createEventBanner);
router.get("/event", banner_controller_1.getAllEventBanners);
router.put("/event/:id", auth_middleware_1.authMiddleware, multer_1.default.fields([
    { name: 'banner', maxCount: 1 }
]), banner_controller_1.updateEventBanner);
router.delete("/event/:id", auth_middleware_1.authMiddleware, banner_controller_1.deleteEventBanner);
// Dashboard Banner Routes
router.post("/dashboard", auth_middleware_1.authMiddleware, multer_1.default.fields([
    { name: 'banner', maxCount: 1 }
]), banner_controller_1.createDashboardBanner);
router.get("/dashboard", auth_middleware_1.authMiddleware, banner_controller_1.getAllDashboardBanners);
router.put("/dashboard/:id", auth_middleware_1.authMiddleware, multer_1.default.fields([
    { name: 'banner', maxCount: 1 }
]), banner_controller_1.updateDashboardBanner);
router.delete("/dashboard/:id", auth_middleware_1.authMiddleware, banner_controller_1.deleteDashboardBanner);
// Wellness Banner Routes
router.post("/wellness", auth_middleware_1.authMiddleware, multer_1.default.fields([
    { name: 'video', maxCount: 1 }
]), banner_controller_1.createWellnessBanner);
router.get("/wellness", auth_middleware_1.authMiddleware, banner_controller_1.getAllWellnessBanners);
router.put("/wellness/:id", auth_middleware_1.authMiddleware, multer_1.default.fields([
    { name: 'banner', maxCount: 1 }
]), banner_controller_1.updateWellnessBanner);
router.delete("/wellness/:id", auth_middleware_1.authMiddleware, banner_controller_1.deleteWellnessBanner);
// Welcome Banner Routes
router.post("/welcome", auth_middleware_1.authMiddleware, multer_1.default.fields([
    { name: 'image', maxCount: 1 }
]), banner_controller_1.createWelcomeBanner);
router.get("/welcome", banner_controller_1.getAllWelcomeBanners);
router.put("/welcome/:id", auth_middleware_1.authMiddleware, multer_1.default.fields([
    { name: 'image', maxCount: 1 }
]), banner_controller_1.updateWelcomeBanner);
router.delete("/welcome/:id", auth_middleware_1.authMiddleware, banner_controller_1.deleteWelcomeBanner);
exports.default = router;
