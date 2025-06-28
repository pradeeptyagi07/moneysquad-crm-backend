"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWelcomeBannerSchema = exports.welcomeBannerSchema = exports.updateWellnessBannerSchema = exports.wellnessBannerSchema = exports.updateDashboardBannerScheema = exports.dashboardBannerSchema = exports.updateEventBannerSchema = exports.eventBannerSchema = void 0;
// src/validations/banner.validation.ts
const zod_1 = require("zod");
exports.eventBannerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    description: zod_1.z.string().optional(),
    location: zod_1.z.string().min(1, "Location is required"),
    date: zod_1.z.coerce.date(),
    active: zod_1.z.coerce.boolean(),
});
exports.updateEventBannerSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    date: zod_1.z.coerce.date().optional(),
    active: zod_1.z.coerce.boolean().optional(),
    banner: zod_1.z.string().optional(),
});
exports.dashboardBannerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    active: zod_1.z.coerce.boolean(),
});
exports.updateDashboardBannerScheema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    active: zod_1.z.coerce.boolean().optional(),
});
exports.wellnessBannerSchema = zod_1.z.object({
    description: zod_1.z.string().min(1, "Description is required"),
    active: zod_1.z.coerce.boolean(),
});
exports.updateWellnessBannerSchema = zod_1.z.object({
    description: zod_1.z.string().optional(),
    active: zod_1.z.coerce.boolean().optional(),
});
exports.welcomeBannerSchema = zod_1.z.object({
    text: zod_1.z.string().min(1, "Text is required"),
    active: zod_1.z.coerce.boolean()
});
exports.updateWelcomeBannerSchema = zod_1.z.object({
    text: zod_1.z.string().optional(),
    active: zod_1.z.coerce.boolean().optional()
});
