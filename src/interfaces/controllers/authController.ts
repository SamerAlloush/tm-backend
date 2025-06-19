import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../application/services/authService';
import { UserRepositoryImpl } from '../../infrastructure/database/repositories/userRepositoryImpl';
import { User } from '../../domain/entities/user';

const userRepository = new UserRepositoryImpl();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export const signup = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const hashedPassword = await AuthService.hashPassword(password);
    const user: User = {
      id: '',
      name,
      email,
      phone,
      password: hashedPassword,
    };
    const createdUser = await userRepository.create(user);
    res.status(201).json({ message: 'User created', user: { id: createdUser.id, name, email, phone } });
  } catch (err) {
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
    const token = AuthService.generateToken({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}); 