import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kapitor API',
      version: '1.0.0',
      description: 'Kapitor Express + MongoDB API documentation',
    },
    servers: [
      {
        url: 'kapitor-be-production.up.railway.app',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token from OTP verification',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              description: 'Response payload',
            },
          },
          required: ['success', 'data'],
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              description: 'Error message',
            },
            details: {
              type: 'object',
              description: 'Additional error details',
            },
          },
          required: ['success', 'error'],
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            dob: { type: 'string' },
            nationality: { type: 'string' },
            phoneNumber: { type: 'string' },
            address: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            zipCode: { type: 'string' },
            country: { type: 'string' },
            walletAddress: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'OTP', description: 'OTP verification endpoints' },
      { name: 'User', description: 'User profile endpoints' },
      { name: 'KYC', description: 'KYC submission endpoints' },
      { name: 'BusinessUser', description: 'Business user endpoints' },
      { name: 'Payment', description: 'Payment processing endpoints' },
    ],
  },
  apis: [
    path.join(__dirname, `../routes/index${path.extname(__filename)}`),
    path.join(__dirname, `../routes/otp.routes${path.extname(__filename)}`),
    path.join(__dirname, `../routes/user.routes${path.extname(__filename)}`),
    path.join(__dirname, `../routes/kyc.routes${path.extname(__filename)}`),
    path.join(
      __dirname,
      `../routes/business-user.routes${path.extname(__filename)}`
    ),
    path.join(__dirname, `../routes/payment.routes${path.extname(__filename)}`),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
