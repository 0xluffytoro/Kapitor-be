import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'Express + MongoDB API docs',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },

  // where your routes live
  apis: ['./routes/index.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
