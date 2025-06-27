import express, { Router } from 'express';
import { signup, login, verifySignup, resendSignupOtp, debugOtp, getProfile, updateProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router: Router = express.Router();

router.post('/signup', signup);
router.post('/verify-signup', verifySignup);
router.post('/verify-otp', verifySignup); // Alias for verify-signup
router.post('/resend-signup-otp', resendSignupOtp);
router.post('/resend-otp', resendSignupOtp); // Alias for resend-signup-otp
router.post('/debug-otp', debugOtp); // Debug endpoint
router.post('/login', login);

// Protected profile routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

export default router; 