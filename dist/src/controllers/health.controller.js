"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
const os_1 = __importDefault(require("os"));
const healthCheck = async (req, res) => {
    try {
        // Server health metrics
        const serverHealth = {
            status: 'healthy',
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage?.() || 'Not available',
            loadAverage: os_1.default.loadavg(),
            freeMemory: os_1.default.freemem(),
            totalMemory: os_1.default.totalmem(),
            timestamp: new Date().toISOString(),
            nodeVersion: process.version,
            platform: process.platform
        };
        // Database health check using Prisma
        let dbHealth;
        try {
            const start = process.hrtime();
            // Simple query to verify database connection
            await client_1.default.$queryRaw `SELECT 1`;
            const [seconds, nanoseconds] = process.hrtime(start);
            const responseTime = seconds * 1000 + nanoseconds / 1000000;
            // Additional checks if needed
            const dbVersion = await client_1.default.$queryRaw `SELECT version()`;
            dbHealth = {
                status: 'connected',
                responseTime: `${responseTime.toFixed(2)}ms`,
                databaseVersion: dbVersion[0]?.version || 'unknown'
            };
        }
        catch (dbError) {
            dbHealth = {
                status: 'disconnected',
                error: dbError.message
            };
            serverHealth.status = 'degraded';
        }
        res.status(200).json({
            status: serverHealth.status,
            server: serverHealth,
            database: dbHealth
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
};
exports.healthCheck = healthCheck;
