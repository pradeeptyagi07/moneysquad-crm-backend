import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { errorHandler } from "./middleware/error.middleware";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

import dotenv from "dotenv";


import healthRoute from "./routes/health.routes";
import commonRoute from "./routes/common.routes";
import authRoutes from "./routes/auth.routes";

import adminRoutes from "./routes/v1/admin.routes";
import managerRoutes from "./routes/v1/manager.routes";
import offerRoutes from "./routes/v1/offer.routes";
import partnerRoutes from "./routes/v1/partner.routes";
import leadRoutes from "./routes/v1/leads.routes";
import associateRoutes from "./routes/v1/assocaite.route";
import matrixRoutes from "./routes/v1/lenderLoanMatrix.routes";
import commissionRoutes from "./routes/v1/commision.routes";
import requestRoutes from "./routes/v1/changeRequest.routes";
import supportRoutes from "./routes/support.routes";
import productInfoRoutes from "./routes/productInfo.routes";
import bankRoutes from "./routes/bank.routes";
import dashboardRoutes from "./routes/dashboard.routes";

import { expireLeadsBasedOnTimeline } from "./script/task";

import cron from 'node-cron';


dotenv.config();


const app = express();

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.aimym.com"],
            fontSrc: ["'self'", "data:", "https:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            sandbox: ["allow-forms", "allow-scripts", "allow-same-origin"]
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const corsOptions = {
    // origin: process.env.NODE_ENV === 'production'
    //     ? ['https://aimym.com', 'https://www.aimym.com']
    //     : ['http://178.236.185.187:3000','http://localhost:5000', 'http://localhost:8080', 'http://localhost:3000'],
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
    maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());




// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "AIMYM API Documentation"
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/common", commonRoute);
app.use("/api", healthRoute);

app.use("/api/admin/", adminRoutes);
app.use("/api/manager/", managerRoutes);
app.use("/api/offers/", offerRoutes);
app.use("/api/partner/", partnerRoutes);
app.use("/api/lead", leadRoutes);
app.use("/api/associate", associateRoutes);
app.use("/api/matrix", matrixRoutes);
app.use("/api/commission", commissionRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/product-info", productInfoRoutes);
app.use("/api/bank", bankRoutes);
app.use("/api/dashboard", dashboardRoutes);


cron.schedule('0 0 * * *', async () => {
    const now = new Date();
    console.log(`⏰ Running lead expiry cron job at ${now.toISOString()}`);
    await expireLeadsBasedOnTimeline(now);
});

// Error handling middleware
app.use(errorHandler);

export default app;