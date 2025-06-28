"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
const successResponse = (res, data, message = "Success") => {
    return res.status(200).json({ success: true, message, data });
};
exports.successResponse = successResponse;
const errorResponse = (res, error) => {
    const status = error?.status || 500;
    const message = error?.message || "Internal Server Error";
    return res.status(status).json({ success: false, message, status });
};
exports.errorResponse = errorResponse;
