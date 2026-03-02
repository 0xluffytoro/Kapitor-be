import { Router } from 'express';
import { createOrder, verifyPayment } from '../controllers/payment.controller';

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
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 currency:
 *                   type: string
 *                 receipt:
 *                   type: string
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
 *               - order_id
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *                 example: ""
 *               razorpay_payment_id:
 *                 type: string
 *                 example: ""
 *               razorpay_signature:
 *                 type: string
 *                 example: ""
 *     responses:
 *       200:
 *         description: Order updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Missing order_id
 *       404:
 *         description: Order not found
 */
router.post('/verify-payment', verifyPayment);

export default router;
