"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_controller_1 = require("../controllers/admin.controller");
const multer_1 = __importDefault(require("../utils/multer"));
const router = express_1.default.Router();
//Organization crud
router.post('/organization/create', auth_middleware_1.authMiddleware, multer_1.default.fields([
    { name: 'logo', maxCount: 1 },
]), admin_controller_1.createOrganizationByAdmin);
router.get('/organization/get', auth_middleware_1.authMiddleware, admin_controller_1.getOrganizationsByAdmin);
router.put('/organization/update/:id', auth_middleware_1.authMiddleware, auth_middleware_1.authMiddleware, multer_1.default.fields([
    { name: 'logo', maxCount: 1 },
]), admin_controller_1.updateOrganizationByAdmin);
router.delete('/organization/delete/:id', auth_middleware_1.authMiddleware, admin_controller_1.deleteOrganizationByAdmin);
//Branches crud
router.post('/branch/create/:orgId', auth_middleware_1.authMiddleware, multer_1.default.none(), admin_controller_1.createBranchByAdmin);
router.get('/branch/get/:orgId?', auth_middleware_1.authMiddleware, admin_controller_1.getAllBranchesByAdmin);
router.put('/branch/update/:id', auth_middleware_1.authMiddleware, multer_1.default.none(), admin_controller_1.updateBranchByAdmin);
router.delete('/branch/delete/:id', auth_middleware_1.authMiddleware, admin_controller_1.deleteBranchByAdmin);
exports.default = router;
