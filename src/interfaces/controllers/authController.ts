import { Request, Response, NextFunction, RequestHandler } from 'express';
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
        name: string;
        email: string;
        role?: string;
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

function asyncHandler(fn: (req: Request, res: Response, next?: NextFunction) => Promise<any>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error('Async handler error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
  };
}

// Step 1: Initial signup - generates OTP and sends email
export const signup: RequestHandler = async (req, res) => {
  try {
    console.log('Raw request body:', req.body);
    console.log('Headers:', req.headers);
    
    const { name, email, phone, password } = req.body;
    // Handle both role formats
    let role = req.body.role;
    if (!role && req.body.roles && Array.isArray(req.body.roles) && req.body.roles.length > 0) {
      role = req.body.roles[0];
      console.log('Extracted role from roles array:', role);
    }
    
    // Log the request body for debugging (remove in production)
    console.log('Signup request processing:', {
      name,
      email,
      phone,
      roleReceived: role,
      roleType: typeof role,
      isArray: Array.isArray(role),
      passwordLength: password?.length,
      rawRole: req.body.role,
      rawRoles: req.body.roles
    });
    
    // Validate all required fields except role first
    const requiredFields = ['name', 'email', 'phone', 'password'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing basic fields:', missingFields);
      res.status(400).json({
        error: 'All fields are required',
        missingFields,
        receivedFields: Object.keys(req.body)
      });
      return;
    }

    // Validate role separately with better error message
    if (!role) {
      console.log('Role validation failed:', {
        receivedRole: role,
        rawRole: req.body.role,
        rawRoles: req.body.roles
      });
      res.status(400).json({
        error: 'Role selection is required',
        availableRoles: RoleUtils.getAvailableRoles(),
        receivedBody: req.body
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Validate password length
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    // Validate and sanitize role
    try {
      const userRole = RoleUtils.validateRole(role);
      console.log(`📝 Signup attempt for ${email} with role: ${userRole}`);
      
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        res.status(409).json({ error: 'User already exists' });
        return;
      }
      
      // Use the RegisterUser use case to create user with OTP
      const registerUserUseCase = new RegisterUser(userRepository);
      const { user, otp } = await registerUserUseCase.execute(name, email, phone, password, userRole);
      
      // Send OTP via email
      await MailService.sendOtpEmail(email, otp);
      
      console.log(`📧 OTP sent to ${email}: ${otp}`); // For debugging (remove in production)
      
      res.status(200).json({ 
        success: true,
        message: 'OTP sent to your email. Please verify to complete registration.',
        email: email,
        requiresVerification: true
      });
      return;
    } catch (error: any) {
      if (error.message && (error.message.includes('Invalid role') || error.message.includes('Role is required'))) {
        res.status(400).json({ 
          error: error.message,
          availableRoles: RoleUtils.getAvailableRoles(),
          details: 'Please select a valid role from the dropdown menu',
          receivedRole: role
        });
        return;
      }
      throw error; // Re-throw if it's not a role validation error
    }
  } catch (err: any) {
    console.error('Signup error:', {
      error: err.message,
      stack: err.stack,
      body: req.body
    });
    res.status(500).json({ 
      error: 'Server error during signup',
      details: err.message 
    });
    return;
  }
};

// Step 2: Verify OTP and complete registration
export const verifySignup: RequestHandler = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400).json({ error: 'Email and OTP are required' });
    return;
  }
  
  console.log(`🔍 Verifying OTP for ${email}: ${otp}`); // Debug log
  
  // Check if user exists
  const user = await userRepository.findByEmail(email);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  
  // Check if user has an OTP
  if (!user.otp) {
    res.status(400).json({ error: 'No OTP found. Please request a new one.' });
    return;
  }
  
  // Check if OTP is expired
  const now = new Date();
  if (!user.otpExpiry || user.otpExpiry < now) {
    res.status(401).json({ error: 'OTP has expired. Please request a new one.' });
    return;
  }
  
  // Check if OTP matches (case-sensitive comparison)
  if (user.otp !== otp.toString()) {
    console.log(`❌ OTP mismatch: expected "${user.otp}", got "${otp}"`);
    res.status(401).json({ error: 'Invalid OTP. Please check and try again.' });
    return;
  }
  
  console.log(`✅ OTP verified successfully for ${email}`);
  
  const verifyOtpUseCase = new VerifyOtp(userRepository, JWT_SECRET);
  const result = await verifyOtpUseCase.execute(email, otp);
  
  if (!result) {
    res.status(401).json({ error: 'OTP verification failed' });
    return;
  }
  
  // Clear resend attempts for this email
  resendAttempts.delete(email);
  
  res.status(201).json({ 
    success: true,
    message: 'Email verified successfully! Your account has been activated.',
    successMessage: `Welcome ${result.user.name}! Your account has been verified. Please login with your email and password.`,
    user: { 
      id: result.user.id, 
      name: result.user.name, 
      email: result.user.email, 
      phone: result.user.phone,
      role: result.user.role
    },
    redirect: {
      path: '/(auth)/login',
      params: {
        email: email,
        message: 'Account verified successfully! Please login with your email and password.'
      }
    },
    accountVerified: true,
    redirectDelay: 2000 // 2 seconds delay before redirect
  });
});

// Resend OTP with rate limiting
export const resendSignupOtp: RequestHandler = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }
  
  // Check rate limiting
  const now = Date.now();
  const attempts = resendAttempts.get(email);
  
  if (attempts) {
    // Check if user is in cooldown period
    if (now - attempts.lastAttempt < RESEND_COOLDOWN) {
      const remainingTime = Math.ceil((RESEND_COOLDOWN - (now - attempts.lastAttempt)) / 1000);
      res.status(429).json({ 
        error: `Please wait ${remainingTime} seconds before requesting another OTP`,
        remainingTime
      });
      return;
    }
    
    // Check if user exceeded max attempts
    if (attempts.count >= MAX_RESEND_ATTEMPTS) {
      res.status(429).json({ 
        error: 'Maximum resend attempts exceeded. Please try again later.',
        maxAttemptsReached: true
      });
      return;
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
    res.status(404).json({ error: 'User not found' });
    return;
  }
  
  // Generate new OTP
  const otp = OtpService.generateOtp();
  const otpExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  
  // Update user with new OTP
  await userRepository.setOtp(email, otp, otpExpiry);
  
  // Send OTP via email
  await MailService.sendOtpEmail(email, otp);
  
  console.log(`📧 Resend OTP to ${email}: ${otp}`); // For debugging (remove in production)
  
  const remainingAttempts = MAX_RESEND_ATTEMPTS - (resendAttempts.get(email)?.count || 0);
  
  res.status(200).json({ 
    message: 'New OTP sent to your email',
    remainingAttempts,
    cooldownPeriod: RESEND_COOLDOWN / 1000 // in seconds
  });
});

// Debug endpoint to check OTP status (remove in production)
export const debugOtp: RequestHandler = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }
  
  const user = await userRepository.findByEmail(email);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  
  const now = new Date();
  const isExpired = user.otpExpiry ? user.otpExpiry < now : true;
  
  res.json({
    email: user.email,
    hasOtp: !!user.otp,
    storedOtp: user.otp, // For debugging only
    otpExpiry: user.otpExpiry,
    isExpired,
    currentTime: now,
    timeRemaining: user.otpExpiry ? Math.max(0, user.otpExpiry.getTime() - now.getTime()) : 0
  });
});

export const login: RequestHandler = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }
  
  const user = await userRepository.findByEmail(email);
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  
  const isMatch = await AuthService.comparePassword(password, user.password);
  if (!isMatch) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  
  const token = AuthService.generateToken({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET);
  
  console.log(`✅ User ${email} logged in successfully`);
  
  res.json({ 
    message: 'Login successful',
    token, 
    user: { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      phone: user.phone,
      role: user.role
    },
    redirect: '/dashboard', // Redirect to dashboard after login
    success: true
  });
});

// Get user profile (protected route)
export const getProfile: RequestHandler = asyncHandler(async (req, res) => {
  console.log('Getting profile for user:', req.user);
  
  if (!req.user?.id) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  
  const getUserProfileUseCase = new GetUserProfile(userRepository);
  const user = await getUserProfileUseCase.execute(req.user.id);
  
  console.log('Retrieved user from database:', user);
  
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  
  console.log(`📋 Profile retrieved for user: ${user.email} with name: ${user.name}`);
  
  const profileData = {
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  };
  
  console.log('Sending profile response:', profileData);
  res.json(profileData);
});

// Update user profile (protected route)
export const updateProfile: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user?.id) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  
  const { name, phone } = req.body;
  
  if (!name && !phone) {
    res.status(400).json({ error: 'At least one field (name or phone) is required' });
    return;
  }
  
  const user = await userRepository.findById(req.user.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
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
      role: result.role
    }
  });
}); 