import { Router } from 'express';
import { validate } from '../middleware/validation';
import {
  sendOtpSchema,
  verifyOtpSchema,
  resendOtpSchema,
} from '../validators/otp.validators';
import { sendOTP, verifyOTP, resendOTP } from '../controllers/otp.controller';

const router = Router();

/**
 * @openapi
 * /otp/send:
 *   post:
 *     summary: Send OTP
 *     description: Sends a 6-digit OTP to the given phone number via SMS
 *     tags:
 *       - OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 15
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *               example:
 *                 success: true
 *                 data:
 *                   message: OTP sent successfully
 *                   expiresIn: 300
 *       400:
 *         description: Invalid phone number
 *       503:
 *         description: Twilio not configured
 */
router.post('/send', validate(sendOtpSchema), sendOTP);

/**
 * @openapi
 * /otp/verify:
 *   post:
 *     summary: Verify OTP
 *     description: Verifies the OTP and returns a JWT token for authentication
 *     tags:
 *       - OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - otp
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 15
 *                 example: "9876543210"
 *               otp:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 pattern: "^\\d+$"
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *               example:
 *                 success: true
 *                 data:
 *                   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                   kycStatus: "pending"
 *       400:
 *         description: OTP not found, expired, or invalid
 *       500:
 *         description: JWT not configured
 */
router.post('/verify', validate(verifyOtpSchema), verifyOTP);

/**
 * @openapi
 * /otp/resend:
 *   post:
 *     summary: Resend OTP
 *     description: Resends a new OTP to the given phone number
 *     tags:
 *       - OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 15
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid phone number
 *       503:
 *         description: Twilio not configured
 */
router.post('/resend', validate(resendOtpSchema), resendOTP);

export default router;
