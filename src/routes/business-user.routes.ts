import { Router } from 'express';
import {
  createBusinessUser,
  getBusinessUser,
} from '../controllers/business-user.controller';

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
 *               - phoneNumber
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
 *               phoneNumber:
 *                 type: string
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

/**
 * @openapi
 * /business-user/{id}:
 *   get:
 *     summary: Get business user account
 *     description: Returns a business user account by ID
 *     tags:
 *       - BusinessUser
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Business user details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid business user ID
 *       401:
 *         description: Missing or invalid Authorization header
 *       404:
 *         description: Business user not found
 */
router.get('/:id', getBusinessUser);

export default router;
