import { Router } from 'express';
import {
  signup,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getUser,
} from '../controllers/authController';
import { auth } from '../middleware/auth';

const router = Router();

// @route   POST api/auth/signup
// @desc    Register a user (Patient, Doctor, or Admin)
router.post('/signup', signup);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', login);

// @route   POST api/auth/verify-email
// @desc    Verify user's email address
router.post('/verify-email', verifyEmail);

// @route   POST api/auth/resend-verification
// @desc    Resend verification email
router.post('/resend-verification', resendVerification);

// @route   POST api/auth/forgot-password
// @desc    Request a password reset link
router.post('/forgot-password', forgotPassword);

// @route   POST api/auth/reset-password
// @desc    Reset password using token
router.post('/reset-password', resetPassword);

// @route   GET api/auth/user
// @desc    Get current authenticated user's details
router.get('/user', auth as any, getUser as any);

export default router;
