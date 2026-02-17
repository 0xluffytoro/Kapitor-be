import { Router } from 'express';
import { submitKyc } from '../controllers/kyc.controller';

const router = Router();

/**
 * @openapi
 * /kyc:
 *   post:
 *     summary: Submit KYC documents
 *     description: Accepts KYC documents and returns a completion message
 *     tags:
 *       - KYC
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               documents:
 *                 type: object
 *                 additionalProperties: true
 *                 description: KYC documents payload
 *     responses:
 *       200:
 *         description: KYC completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               data:
 *                 message: KYC completed successfully
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Missing or invalid Authorization header
 */
router.post('/', submitKyc);

export default router;
