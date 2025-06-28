"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const multer_1 = __importDefault(require("../utils/multer"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication related APIs
 */
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phoneNumber:
 *                 type: string
 *               gender:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               bloodGroup:
 *                 type: string
 *               primary_member:
 *                 type: boolean
 *               aimym_member:
 *                 type: boolean
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
router.post("/register", multer_1.default.fields([
    { name: 'avatar', maxCount: 1 },
]), auth_controller_1.register);
/**
 * @swagger
 * /api/auth/register-family:
 *   post:
 *     summary: Register a family member
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phoneNumber:
 *                 type: string
 *               gender:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               bloodGroup:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Family member registered successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/register-family", multer_1.default.fields([
    { name: 'avatar', maxCount: 1 },
]), auth_middleware_1.authMiddleware, auth_controller_1.registerFamilyMember);
/**
 * @swagger
 * /api/auth/user-data:
 *   get:
 *     summary: Get user data
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/user-data", auth_middleware_1.authMiddleware, auth_controller_1.getUserHandler);
/**
 * @swagger
 * /api/auth/update-user:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phoneNumber:
 *                 type: string
 *               gender:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               bloodGroup:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.put("/update-user", multer_1.default.fields([
    { name: 'avatar', maxCount: 1 },
]), auth_middleware_1.authMiddleware, auth_controller_1.updateUserHandler);
router.put("/update-family-member/:memberId", multer_1.default.fields([
    { name: 'avatar', maxCount: 1 },
]), auth_middleware_1.authMiddleware, auth_controller_1.updateFamilyMember);
/**
 * @swagger
 * /api/auth/family:
 *   get:
 *     summary: Get family members
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Family members retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/family", auth_middleware_1.authMiddleware, auth_controller_1.getFamilyHandler);
/**
 * @swagger
 * /api/auth/family-member/{memberId}:
 *   delete:
 *     summary: Delete a family member
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: memberId
 *         in: path
 *         required: true
 *         description: ID of the family member to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Family member deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.delete("/family-member/:memberId", auth_middleware_1.authMiddleware, auth_controller_1.deleteFamilyHandler);
/**
 * @swagger
 * /api/auth/delete/{phoneNumber}:
 *   delete:
 *     summary: Delete a user by phone number
 *     tags: [Auth]
 *     parameters:
 *       - name: phoneNumber
 *         in: path
 *         required: true
 *         description: Phone number of the user to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Bad request
 */
//  
/**
 * @swagger
 * /api/auth/delete:
 *   delete:
 *     summary: Delete the authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete("/delete", auth_middleware_1.authMiddleware, auth_controller_1.deleteUserHandler);
router.post('/admin/login', auth_controller_1.loginUser);
exports.default = router;
