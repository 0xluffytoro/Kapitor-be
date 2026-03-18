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
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Pool'
 *       500:
 *         description: Failed to create pool
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
 *               $ref: '#/components/schemas/PoolListResponse'
 *             example:
 *               success: true
 *               data:
 *                 pools:
 *                   - id: '67d8e8b4a2c9e9a1b2345678'
 *                     poolId: 'POOL-001'
 *                     name: 'Growth Pool Alpha'
 *                     walletAddress: '0x1234567890abcdef1234567890abcdef12345678'
 *                     capacity: 100000
 *                     currenlyFilled: 25000
 *                     startDate: '2026-03-01'
 *                     endDate: '2027-03-01'
 *                     roiOneYear: 12.5
 *                     roiThreeYears: 42.75
 *                     roiFiveYears: 88.1
 *                     min_investment: 1000
 *                     image: 'https://cdn.example.com/pools/growth-alpha.png'
 *       500:
 *         description: Failed to fetch pools
 */
router.get('/', getPools);

export default router;
