import { Request, Response, NextFunction } from 'express';
import twilio from 'twilio';
import jwt from 'jsonwebtoken';
import { Otp } from '../models/Otp.model';
import { PhoneNumbers } from '../models/PhoneNumbers.model';
import { sendSuccess, sendError } from '../utils/response';
import { Kyc } from '../models/Kyc.model';
import { User } from '../models/User.model';

const OTP_EXPIRATION_SECONDS = 300; // 5 minutes
const OTP_LENGTH = 6;

/**
 * Generate a random numeric OTP
 */
function generateOTP(): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

/**
 * Format phone number to E.164 (Twilio requirement)
 * Expects input like 9876543210 or +919876543210
 */
function toE164(phoneNumber: string): string {
  let cleaned = phoneNumber.replace(/\D/g, '');
  if (!cleaned.startsWith('91') && cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return '+' + cleaned;
}

/**
 * Send OTP to phone number
 * POST /otp/send
 * Body: { phoneNumber }
 */
export async function sendOTP(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { phoneNumber } = req.body;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      sendError(res, 'Twilio is not configured', 503);
      return;
    }

    // Remove any existing OTP for this phone
    await Otp.deleteMany({ phoneNumber });

    const otp = generateOTP();
    const otpExpiration = new Date(Date.now() + OTP_EXPIRATION_SECONDS * 1000);

    await Otp.create({
      phoneNumber,
      otp,
      otpExpiration,
    });

    const client = twilio(accountSid, authToken);
    const toNumber = toE164(phoneNumber);
    const message = `Your Kapitor verification code is: ${otp}. Valid for ${OTP_EXPIRATION_SECONDS} seconds.`;

    await client.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber,
    });

    sendSuccess(
      res,
      {
        message: 'OTP sent successfully',
        expiresIn: OTP_EXPIRATION_SECONDS,
      },
      200
    );
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      const twilioError = error as {
        code?: number;
        status?: number;
        message?: string;
      };
      if (twilioError.code === 21608 || twilioError.code === 21211) {
        sendError(res, 'Invalid phone number', 400);
        return;
      }
      if (twilioError.status === 400) {
        sendError(res, twilioError.message || 'Bad request', 400);
        return;
      }
    }
    next(error);
  }
}

/**
 * Verify OTP
 * POST /otp/verify
 * Body: { phoneNumber, otp }
 */
export async function verifyOTP(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { phoneNumber, otp } = req.body;

    const otpRecord = await Otp.findOne({
      phoneNumber,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      sendError(res, 'OTP not found. Please request a new one.', 400);
      return;
    }

    if (new Date() > otpRecord.otpExpiration) {
      await Otp.deleteOne({ _id: otpRecord._id });
      sendError(res, 'OTP has expired. Please request a new one.', 400);
      return;
    }

    if (otpRecord.otp !== otp) {
      sendError(res, 'Invalid OTP', 400);
      return;
    }

    // Delete OTP after successful verification (one-time use)
    await Otp.deleteOne({ _id: otpRecord._id });

    // Format phone number to E.164 format for consistency
    const formattedPhone = toE164(phoneNumber);

    // Save phone number only and use PhoneNumbers _id as uid
    let phoneRecord = await PhoneNumbers.findOne({
      phoneNumber: formattedPhone,
    });

    if (!phoneRecord) {
      phoneRecord = await PhoneNumbers.create({
        phoneNumber: formattedPhone,
      });
    }

    const uid = phoneRecord._id.toString();

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      sendError(res, 'JWT secret is not configured', 500);
      return;
    }

    const token = jwt.sign({ uid, mobileNumber: formattedPhone }, jwtSecret, {
      expiresIn: '24h',
    });

    const userRecord = await User.findOne({
      phoneNumber: formattedPhone,
    }).select('_id');

    const kycRecord = userRecord
      ? await Kyc.findOne({ userId: userRecord._id }).select('status')
      : null;
    const kycStatus = kycRecord?.status ?? 'pending';

    sendSuccess(res, { token, kycStatus }, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * Resend OTP
 * POST /otp/resend
 * Body: { phoneNumber }
 */
export async function resendOTP(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Reuse sendOTP logic - it deletes existing and creates new
    await sendOTP(req, res, next);
  } catch (error) {
    next(error);
  }
}
