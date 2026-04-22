import { CorsOptions } from 'cors';

const origins = process.env.CORS_ORIGIN?.split(',')
  .map(o => o.trim())
  .filter(Boolean);

export const corsOptions: CorsOptions = {
  origin: origins && origins.length > 0 ? origins : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
