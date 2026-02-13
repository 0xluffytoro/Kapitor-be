import { Router } from 'express';
import otpRoutes from './otp.routes';
import userRoutes from './user.routes';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

router.use('/otp', otpRoutes);
router.use('/user', authenticate, userRoutes);

export default router;
