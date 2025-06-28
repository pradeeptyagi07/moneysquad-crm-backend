"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        res.status(401).json({ error: "Access denied" });
        return; // Explicit return to avoid calling `next()`
    }
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        console.log("decoded", decoded);
        req.user = decoded;
        next(); // Proceed to next middleware/controller
    }
    catch (error) {
        res.status(400).json({ error: "Invalid token" });
        return;
    }
};
exports.authMiddleware = authMiddleware;
