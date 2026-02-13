import { z } from 'zod';

export const sendOtpSchema = z.object({
  body: z.object({
    phoneNumber: z.string().trim().min(10).max(15),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    phoneNumber: z.string().trim().min(10).max(15),
    otp: z.string().length(6).regex(/^\d+$/),
  }),
});

export const resendOtpSchema = z.object({
  body: z.object({
    phoneNumber: z.string().trim().min(10).max(15),
  }),
});
