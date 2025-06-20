import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../application/services/authService';
import { UserRepositoryImpl } from '../../infrastructure/database/repositories/userRepositoryImpl';
import { User } from '../../domain/entities/user';
import { RegisterUser } from '../../domain/usecases/user/registerUser';
import { VerifyOtp } from '../../domain/usecases/user/verifyOtp';
import { GetUserProfile } from '../../domain/usecases/user/getUserProfile';
import { MailService } from '../../application/services/mailService';
import { OtpService } from '../../application/services/otpService';
import { RoleUtils } from '../../utils/roleUtils';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        roles?: string[];
      };
    }
  }
}

const userRepository = new UserRepositoryImpl();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Rate limiting for resend OTP (in production, use Redis or database)
const resendAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_RESEND_ATTEMPTS = 3;
const RESEND_COOLDOWN = 60 * 1000; // 1 minute

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Step 1: Initial signup - generates OTP and sends email
export const signup = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Validate and sanitize role
    const userRole = RoleUtils.validateRole(role);
    
    console.log(`📝 Signup attempt for ${email} with role: ${userRole}`);
    
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Use the RegisterUser use case to create user with OTP
    const registerUserUseCase = new RegisterUser(userRepository);
    const { user, otp } = await registerUserUseCase.execute(name, email, phone, password, userRole);
    
    // Send OTP via email
    await MailService.sendOtpEmail(email, otp);
    
    console.log(`📧 OTP sent to ${email}: ${otp}`); // For debugging (remove in production)
    
    res.status(200).json({ 
      message: 'OTP sent to your email. Please verify to complete registration.',
      email: email,
      requiresVerification: true
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Step 2: Verify OTP and complete registration
export const verifySignup = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }
    
    console.log(`🔍 Verifying OTP for ${email}: ${otp}`); // Debug log
    
    // Check if user exists
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user has an OTP
    if (!user.otp) {
      return res.status(400).json({ error: 'No OTP found. Please request a new one.' });
    }
    
    // Check if OTP is expired
    const now = new Date();
    if (!user.otpExpires || user.otpExpires < now) {
      return res.status(401).json({ error: 'OTP has expired. Please request a new one.' });
    }
    
    // Check if OTP matches (case-sensitive comparison)
    if (user.otp !== otp.toString()) {
      console.log(`❌ OTP mismatch: expected "${user.otp}", got "${otp}"`);
      return res.status(401).json({ error: 'Invalid OTP. Please check and try again.' });
    }
    
    console.log(`✅ OTP verified successfully for ${email}`);
    
    const verifyOtpUseCase = new VerifyOtp(userRepository, JWT_SECRET);
    const result = await verifyOtpUseCase.execute(email, otp);
    
    if (!result) {
      return res.status(401).json({ error: 'OTP verification failed' });
    }
    
    // Clear resend attempts for this email
    resendAttempts.delete(email);
    
    res.status(201).json({ 
      message: 'Email verified successfully! Your account has been activated.',
      successMessage: `Welcome ${result.user.name}! Your account has been verified. Please login with your email and password to access your dashboard.`,
      user: { 
        id: result.user.id, 
        name: result.user.name, 
        email: result.user.email, 
        phone: result.user.phone,
        roles: result.user.roles || ['user']
      },
      redirect: '/login', // Redirect to login page after verification
      success: true,
      accountVerified: true,
      redirectDelay: 3000 // Delay redirect for 3 seconds to show success message
    });
  } catch (err) {
    console.error('Verify signup error:', err);
    res.status(500).json({ error: 'Server error during verification' });
  }
});

// Resend OTP with rate limiting
export const resendSignupOtp = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Check rate limiting
    const now = Date.now();
    const attempts = resendAttempts.get(email);
    
    if (attempts) {
      // Check if user is in cooldown period
      if (now - attempts.lastAttempt < RESEND_COOLDOWN) {
        const remainingTime = Math.ceil((RESEND_COOLDOWN - (now - attempts.lastAttempt)) / 1000);
        return res.status(429).json({ 
          error: `Please wait ${remainingTime} seconds before requesting another OTP`,
          remainingTime
        });
      }
      
      // Check if user exceeded max attempts
      if (attempts.count >= MAX_RESEND_ATTEMPTS) {
        return res.status(429).json({ 
          error: 'Maximum resend attempts exceeded. Please try again later.',
          maxAttemptsReached: true
        });
      }
      
      // Update attempts
      attempts.count++;
      attempts.lastAttempt = now;
    } else {
      // First resend attempt
      resendAttempts.set(email, { count: 1, lastAttempt: now });
    }
    
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate new OTP
    const otp = OtpService.generateOtp();
    const otpExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    
    // Update user with new OTP
    await userRepository.setOtp(email, otp, otpExpires);
    
    // Send OTP via email
    await MailService.sendOtpEmail(email, otp);
    
    console.log(`📧 Resend OTP to ${email}: ${otp}`); // For debugging (remove in production)
    
    const remainingAttempts = MAX_RESEND_ATTEMPTS - (resendAttempts.get(email)?.count || 0);
    
    res.status(200).json({ 
      message: 'New OTP sent to your email',
      remainingAttempts,
      cooldownPeriod: RESEND_COOLDOWN / 1000 // in seconds
    });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ error: 'Server error during OTP resend' });
  }
});

// Debug endpoint to check OTP status (remove in production)
export const debugOtp = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const now = new Date();
    const isExpired = user.otpExpires ? user.otpExpires < now : true;
    
    res.json({
      email: user.email,
      hasOtp: !!user.otp,
      storedOtp: user.otp, // For debugging only
      otpExpires: user.otpExpires,
      isExpired,
      currentTime: now,
      timeRemaining: user.otpExpires ? Math.max(0, user.otpExpires.getTime() - now.getTime()) : 0
    });
  } catch (err) {
    console.error('Debug OTP error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isMatch = await AuthService.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = AuthService.generateToken({ id: user.id, email: user.email, roles: user.roles }, JWT_SECRET);
    
    console.log(`✅ User ${email} logged in successfully`);
    
    res.json({ 
      message: 'Login successful',
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone,
        roles: user.roles || ['user']
      },
      redirect: '/dashboard', // Redirect to dashboard after login
      success: true
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get user profile (protected route)
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const getUserProfileUseCase = new GetUserProfile(userRepository);
    const user = await getUserProfileUseCase.execute(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log(`📋 Profile retrieved for user: ${user.email}`);
    
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        roles: user.roles || ['user']
      }
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
});

// Update user profile (protected route)
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { name, phone } = req.body;
    
    if (!name && !phone) {
      return res.status(400).json({ error: 'At least one field (name or phone) is required' });
    }
    
    const user = await userRepository.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user data
    const updatedUser = {
      ...user,
      name: name || user.name,
      phone: phone || user.phone
    };
    
    const result = await userRepository.update(updatedUser);
    
    console.log(`📝 Profile updated for user: ${result.email}`);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        phone: result.phone,
        roles: result.roles || ['user']
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server error while updating profile' });
  }
}); 