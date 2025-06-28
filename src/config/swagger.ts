import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from "dotenv";

dotenv.config();


const options: swaggerJsdoc.Options = {
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

export const swaggerSpec = swaggerJsdoc(options); 