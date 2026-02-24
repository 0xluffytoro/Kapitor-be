import { Router } from 'express';
import {
  invest,
  getInvestments,
  totalInvestment,
} from '../controllers/invest.controller';

const router = Router();

/**
 * @openapi
 * /invest:
 *   post:
 *     summary: Invest in a pool
 *     description: Transfers tokens from the user to the pool wallet and records the investment transaction.
 *     tags:
 *       - Investment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - poolAddress
 *               - amount
 *             properties:
 *               poolAddress:
 *                 type: string
 *                 example: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
 *               amount:
 *                 type: number
 *                 example: 1500
 *     responses:
 *       201:
 *         description: Investment successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post('/', invest);

/**
 * @openapi
 * /invest:
 *   get:
 *     summary: Get user's investments
 *     description: Returns all investment transactions for the authenticated user.
 *     tags:
 *       - Investment
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Investment transactions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.get('/', getInvestments);

/**
 * @openapi
 * /invest/total:
 *   get:
 *     summary: Get total investment
 *     description: Returns the sum of all investment amounts for the authenticated user.
 *     tags:
 *       - Investment
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total investment amount
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.get('/total', totalInvestment);

export default router;
