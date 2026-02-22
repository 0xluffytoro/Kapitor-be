import 'dotenv/config';
import express, { Express } from 'express';
import cors from 'cors';
import { connectDatabase } from './config/database';
import { corsOptions } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger';
import routes from './routes';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check Route
app.get('/', (_, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Kapitor API is running 🚀',
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/', routes);

// Global Error Handler
app.use(errorHandler);

// Start Server
const startServer = async () => {
  try {
    await connectDatabase();
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📚 Swagger Docs: http://localhost:${PORT}/docs`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
