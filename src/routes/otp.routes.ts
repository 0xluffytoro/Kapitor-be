import { Router } from 'express';
import { validate } from '../middleware/validation';
import {
  sendOtpSchema,
  verifyOtpSchema,
  resendOtpSchema,
} from '../validators/otp.validators';
import { sendOTP, verifyOTP, resendOTP } from '../controllers/otp.controller';

const router = Router();

router.post('/send', validate(sendOtpSchema), sendOTP);
router.post('/verify', validate(verifyOtpSchema), verifyOTP);
router.post('/resend', validate(resendOtpSchema), resendOTP);

export default router;
