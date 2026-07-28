import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import * as authController from '../controllers/auth.js';
import { DEPT_CODES, LEVELS } from '../config/constants.js';

const router = Router();

const registerSchema = z.object({
  matric_number: z.string().min(5).max(20),
  full_name: z.string().min(2).max(200),
  department: z.string().refine(d => DEPT_CODES.includes(d), {
    message: 'Must be a valid Engineering department code',
  }),
  level: z.string().refine(l => LEVELS.includes(l), {
    message: 'Invalid level',
  }),
  phone: z.string().optional(),
});

const verifyOtpSchema = z.object({
  matric_number: z.string(),
  otp: z.string().length(6),
});

const loginSchema = z.object({
  matric_number: z.string(),
  password: z.string().min(6),
});

const verifyLoginOtpSchema = z.object({
  user_id: z.string().uuid(),
  otp: z.string().length(6),
});

router.post('/register', validate(registerSchema), authController.register);
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);
router.post('/login', validate(loginSchema), authController.login);
router.post('/verify-login-otp', validate(verifyLoginOtpSchema), authController.verifyLoginOtp);
router.get('/me', authenticate, authController.me);
router.patch('/me', authenticate, authController.updateMyProfile);

export default router;
