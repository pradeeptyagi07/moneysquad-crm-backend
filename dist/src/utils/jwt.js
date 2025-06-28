"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SECRET = process.env.JWT_SECRET || "fxmobileapp";
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, SECRET, { expiresIn: "7d" });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, SECRET);
};
exports.verifyToken = verifyToken;
