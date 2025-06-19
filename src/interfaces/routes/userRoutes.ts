import { Router } from 'express';
import { UserController } from '../controllers/userController';

const router = Router();

// This file handles user resource routes, not authentication. See authRoutes.ts for signup/login.

router.post('/verify-otp', async (req, res) => { await UserController.verifyOtp(req, res); });

export default router;
