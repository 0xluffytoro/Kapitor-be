import { Router } from 'express';
import otpRoutes from './otp.routes';
import userRoutes from './user.routes';
import kycRoutes from './kyc.routes';
import businessUserRoutes from './business-user.routes';
import paymentRoutes from './payment.routes';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     description: Returns server status and timestamp
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Server is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

router.use('/otp', otpRoutes);
router.use('/user', authenticate, userRoutes);
router.use('/kyc', authenticate, kycRoutes);
router.use('/business-user', authenticate, businessUserRoutes);
router.use('/payment', authenticate, paymentRoutes);

export default router;
