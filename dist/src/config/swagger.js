"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AIMYM API Documentation',
            version: '1.0.0',
            description: 'API documentation for AIMYM Backend Service',
            contact: {
                name: 'AIMYM Team',
                email: 'support@aimym.com'
            }
        },
        servers: [
            {
                url: process.env.LOCAL_SERVER_URL,
                description: 'Local server'
            },
            {
                url: process.env.DEVELOPMENT_SERVER_URL,
                description: 'Development server'
            },
            {
                url: process.env.PRODUCTION_SERVER_URL,
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{
                bearerAuth: []
            }]
    },
    apis: ['./src/routes/*.ts', './src/models/*.ts'], // Path to the API routes and models
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
