import { Router } from 'express';
import {
  createUser,
  getDetails,
  getRecentTransactions,
  getBalance,
  getUserTransactions,
  sendTransaction,
  verifyTransaction,
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
 *               phoneNumber:
 *                type: string
 *                 example: "+919876543210"
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
 *                   kycStatus: "pending"
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: User not found
 */
router.get('/details', getDetails);

/**
 * @openapi
 * /user/balance:
 *   get:
 *     summary: Get user wallet balance
 *     description: Returns the authenticated user's wallet balance via RPC.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet balance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: User wallet not found
 */
router.get('/balance', getBalance);

/**
 * @openapi
 * /user/transactions:
 *   get:
 *     summary: Get user transactions
 *     description: Returns the authenticated user's transactions.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: number
 *           example: 50
 *     responses:
 *       200:
 *         description: User transactions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Missing or invalid token
 */
router.get('/transactions', getUserTransactions);

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

const transactionRouter = Router();

/**
 * @openapi
 * /user/transaction/send-transaction:
 *   post:
 *     summary: Send transaction OTP
 *     description: Creates a pending transaction and sends an OTP to the user's phone.
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
 *             required:
 *               - amount
 *               - recipientAddress
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 10
 *               recipientAddress:
 *                 type: string
 *                 example: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
 *     responses:
 *       200:
 *         description: Pending transaction created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Missing or invalid token
 */
transactionRouter.post('/send-transaction', sendTransaction);

/**
 * @openapi
 * /user/transaction/verify-transaction:
 *   post:
 *     summary: Verify transaction OTP
 *     description: Verifies OTP and executes the pending transaction.
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
 *             required:
 *               - transactionId
 *               - otp
 *             properties:
 *               transactionId:
 *                 type: string
 *                 example: "64e7c2b9d3f2a5b9c9b8fabc"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Transaction verified and sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Missing or invalid token
 */
transactionRouter.post('/verify-transaction', verifyTransaction);

router.use('/transaction', transactionRouter);

export default router;
