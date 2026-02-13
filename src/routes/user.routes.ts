import { Router } from 'express';
import { getDetails } from '../controllers/user.controller';

const router = Router();

/**
 * @openapi
 * /user/details:
 *   get:
 *     summary: Get user details
 *     description: Returns the authenticated user's profile including address fields (address, city, state, zipCode, country)
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *               example:
 *                 success: true
 *                 data:
 *                   id: "507f1f77bcf86cd799439011"
 *                   name: "John Doe"
 *                   dob: "1990-01-15"
 *                   nationality: "Indian"
 *                   phoneNumber: "+919876543210"
 *                   address: "123 Main Street"
 *                   city: "Mumbai"
 *                   state: "Maharashtra"
 *                   zipCode: "400001"
 *                   country: "India"
 *                   walletAddress: "0x..."
 *                   role: "user"
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: User not found
 */
router.get('/details', getDetails);

export default router;
