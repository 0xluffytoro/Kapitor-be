import { Router } from 'express';
import { createBusinessUser } from '../controllers/business-user.controller';

const router = Router();

/**
 * @openapi
 * /business-user:
 *   post:
 *     summary: Create business user account
 *     description: Creates a business user account
 *     tags:
 *       - BusinessUser
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessName
 *               - businessEntitiyType
 *               - companyRegistration
 *               - dateOfIncorporation
 *               - ownerName
 *               - ownerShipPercentage
 *             properties:
 *               businessName:
 *                 type: string
 *               businessEntitiyType:
 *                 type: string
 *               companyRegistration:
 *                 type: string
 *               dateOfIncorporation:
 *                 type: string
 *               ownerName:
 *                 type: string
 *               ownerShipPercentage:
 *                 type: number
 *     responses:
 *       201:
 *         description: Business user created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Missing or invalid Authorization header
 */
router.post('/', createBusinessUser);

export default router;
