import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
} from '../controllers/payment.controller.js';

const router = Router();

/**
 * @openapi
 * /payment/create-order:
 *   post:
 *     summary: Create Razorpay order
 *     description: Creates a Razorpay order and stores it in the database.
 *     tags:
 *       - Payment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *               - receipt
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 280
 *               currency:
 *                 type: string
 *                 example: "INR"
 *               receipt:
 *                 type: string
 *                 example: "receipt#1"
 *               notes:
 *                 type: object
 *                 example:
 *                   orderType: "subscription"
 *     responses:
 *       200:
 *         description: Razorpay order created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Missing or invalid token
 */
router.post('/create-order', createOrder);

/**
 * @openapi
 * /payment/verify-payment:
 *   post:
 *     summary: Verify payment
 *     description: Verifies payment and updates the order status.
 *     tags:
 *       - Payment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_order_id
 *               - razorpay_payment_id
 *               - razorpay_signature
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *                 example: "order_Pn8Jf9t8w1nQWx"
 *               razorpay_payment_id:
 *                 type: string
 *                 example: "pay_Pn8K2x7r2xVbY3"
 *               razorpay_signature:
 *                 type: string
 *                 example: "a9d8f4f7506d..."
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Payment verification failed
 *       401:
 *         description: Missing required fields or invalid token
 *       403:
 *         description: Wallet address not found for the user
 */
router.post('/verify-payment', verifyPayment);

export default router;
