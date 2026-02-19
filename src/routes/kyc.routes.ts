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
 *               adhaarCard:
 *                 type: string
 *                 description: Adhaar card
 *               drivingLicense:
 *                 type: string
 *                 description: Driving license
 *               panCard:
 *                 type: string
 *                 description: PAN card
 *     responses:
 *       200:
 *         description: Document submitted successfully, KYC under process
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               data:
 *                 message: Document submitted successfully, KYC under process
 *       400:
 *         description: At least one document is required
 *       401:
 *         description: Missing or invalid Authorization header
 */
router.post('/', submitKyc);

export default router;
