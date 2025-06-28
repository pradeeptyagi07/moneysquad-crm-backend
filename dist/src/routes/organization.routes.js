"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const organization_controller_1 = require("../controllers/organization.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const multer_1 = __importDefault(require("../utils/multer"));
const helper_controller_1 = require("../controllers/helper.controller");
const router = express_1.default.Router();
router.get("/", auth_middleware_1.authMiddleware, organization_controller_1.getOrganizations);
router.get("/branches", auth_middleware_1.authMiddleware, organization_controller_1.getBranches);
router.get("/branch-details", auth_middleware_1.authMiddleware, organization_controller_1.getBranchDetails);
router.post("/recent-view/:branchId", auth_middleware_1.authMiddleware, organization_controller_1.createRecentViewHandler);
router.get("/list-views", auth_middleware_1.authMiddleware, organization_controller_1.getRecentViewsHandler);
// GET /api/states - Get all states
router.get("/state", organization_controller_1.getAllStates);
// GET /api/cities/:stateId - Get all cities by state ID
router.get("/city/:stateId", organization_controller_1.getCitiesByState);
router.post('/branch/:branchId/react', auth_middleware_1.authMiddleware, organization_controller_1.reactToBranch);
router.get('/branch/:branchId', auth_middleware_1.authMiddleware, organization_controller_1.getBranchReaction);
router.post('/feedback/:branchId/submit', auth_middleware_1.authMiddleware, organization_controller_1.submitFeedback);
router.get('/feedback/:branchId', organization_controller_1.getFeedbacks);
//Get fevorite
router.get('/favorite', auth_middleware_1.authMiddleware, organization_controller_1.getFevorite);
router.post("/upload-state-city", multer_1.default.single("file"), helper_controller_1.uploadOrganizationBranchExcel);
exports.default = router;
