import { Router } from 'express';
import {
  createOrder,
  paymentSuccess,
  verifyPayment,
} from '../controllers/payment.controller';

const router = Router();

/**
 * @openapi
 * /payment/create-order:
 *   post:
 *     summary: Create Razorpay order
 *     description: Creates a Razorpay order and stores it in the database.
 *     tags:
 *       - Payment
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
 * /payment/payment-success:
 *   post:
 *     summary: Mark payment successful
 *     description: Updates an order with payment details after successful payment.
 *     tags:
 *       - Payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - userId
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 280
 *               address:
 *                 type: string
 *                 example: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
 *               userId:
 *                 type: string
 *                 example: "64e7c2b9d3f2a5b9c9b8fabc"
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
router.post('/payment-success', paymentSuccess);

/**
 * @openapi
 * /payment/verify-payment:
 *   post:
 *     summary: Verify payment
 *     description: Verifies payment and updates the order status.
 *     tags:
 *       - Payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *             properties:
 *               order_id:
 *                 type: string
 *                 example: "order_OYqXa85ILOfhH9"
 *               payment_id:
 *                 type: string
 *                 example: "pay_OYqXio9j7ijhmi"
 *               status:
 *                 type: string
 *                 example: "paid"
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
