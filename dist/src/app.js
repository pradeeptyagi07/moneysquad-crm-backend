"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const otp_routes_1 = __importDefault(require("./routes/otp.routes"));
const card_routes_1 = __importDefault(require("./routes/card.routes"));
const transaction_routes_1 = __importDefault(require("./routes/transaction.routes"));
const organization_routes_1 = __importDefault(require("./routes/organization.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const banner_routes_1 = __importDefault(require("./routes/banner.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)({
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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
    maxAge: 86400 // 24 hours
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.use((0, cookie_parser_1.default)());
// Swagger Documentation
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "AIMYM API Documentation"
}));
// Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/otp", otp_routes_1.default);
app.use("/api/card", card_routes_1.default);
app.use("/api/payment", transaction_routes_1.default);
app.use("/api/organizations", organization_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/banner", banner_routes_1.default);
app.use("/api", health_routes_1.default);
// Error handling middleware
app.use(error_middleware_1.errorHandler);
exports.default = app;
