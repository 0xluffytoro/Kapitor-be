import { Router } from 'express';
import {
  createUser,
  getDetails,
  getRecentTransactions,
} from '../controllers/user.controller';

const router = Router();

/**
 * @openapi
 * /user:
 *   post:
 *     summary: Create user profile
 *     description: Creates a user profile linked to the authenticated phone number
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               dob:
 *                 type: string
 *               nationality:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               country:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: Phone number not found
 *       409:
 *         description: User already exists
 */
router.post('/', createUser);

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

/**
 * @openapi
 * /user/recent-transactions:
 *   get:
 *     summary: Get recent transactions
 *     description: Returns latest 10 transactions for the authenticated user and recent recipient addresses.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent transactions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Missing or invalid token
 */
router.get('/recent-transactions', getRecentTransactions);

export default router;
