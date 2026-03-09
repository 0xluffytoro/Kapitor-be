import { Router } from 'express';
import { createPool, getPools } from '../controllers/pools.controller.js';

const router = Router();

/**
 * @openapi
 * /pools:
 *   post:
 *     summary: Create a pool
 *     description: Creates a pool record and generates a new wallet address for the pool.
 *     tags:
 *       - Pools
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - poolId
 *               - name
 *               - capacity
 *               - startDate
 *               - endDate
 *               - roiOneYear
 *               - roiThreeYears
 *               - roiFiveYears
 *               - min_investment
 *             properties:
 *               poolId:
 *                 type: string
 *               name:
 *                 type: string
 *               capacity:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               roiOneYear:
 *                 type: number
 *               roiThreeYears:
 *                 type: number
 *               roiFiveYears:
 *                 type: number
 *               min_investment:
 *                 type: number
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pool created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post('/', createPool);

/**
 * @openapi
 * /pools:
 *   get:
 *     summary: Get all pools
 *     description: Returns all pools.
 *     tags:
 *       - Pools
 *     responses:
 *       200:
 *         description: Pools fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.get('/', getPools);

export default router;
