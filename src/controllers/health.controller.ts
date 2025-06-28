import { Request, Response } from 'express';
import os from 'os';

export const healthCheck = async (req: Request, res: Response) => {
    try {
        // Server health metrics
        const serverHealth = {
            status: 'healthy',
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage?.() || 'Not available',
            loadAverage: os.loadavg(),
            freeMemory: os.freemem(),
            totalMemory: os.totalmem(),
            timestamp: new Date().toISOString(),
            nodeVersion: process.version,
            platform: process.platform
        };


        res.status(200).json({
            status: serverHealth.status,
            server: serverHealth,
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
};