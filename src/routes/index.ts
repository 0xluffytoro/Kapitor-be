import { Router } from 'express';
import otpRoutes from './otp.routes.js';
import userRoutes from './user.routes.js';
import kycRoutes from './kyc.routes.js';
import businessUserRoutes from './business-user.routes.js';
import paymentRoutes from './payment.routes.js';
import investRoutes from './invest.routes.js';
import poolsRoutes from './pools.routes.js';
import { authenticate } from '../middleware/auth.js';

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
router.use('/invest', authenticate, investRoutes);
router.use('/pools', poolsRoutes);

export default router;
