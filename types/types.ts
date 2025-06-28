export interface HealthCheckResponse {
    status: 'healthy' | 'degraded' | 'unhealthy';
    server: {
        status: string;
        uptime: number;
        memoryUsage: NodeJS.MemoryUsage;
        cpuUsage: NodeJS.CpuUsage | string;
        loadAverage: number[];
        freeMemory: number;
        totalMemory: number;
        timestamp: string;
        nodeVersion?: string;
        platform?: string;
    };
    database: {
        status: string;
        responseTime?: string;
        databaseVersion?: string;
        error?: string;
    };
}