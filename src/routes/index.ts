import { Router } from 'express';
import otpRoutes from './otp.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

router.use('/otp', otpRoutes);

export default router;
