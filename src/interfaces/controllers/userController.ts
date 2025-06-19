import { Request, Response } from 'express';
import { UserRepositoryImpl } from '../../infrastructure/database/repositories/userRepositoryImpl';
import { RegisterUser } from '../../domain/usecases/user/registerUser';
import { LoginUser } from '../../domain/usecases/user/loginUser';
import { VerifyOtp } from '../../domain/usecases/user/verifyOtp';
import { MailService } from '../../application/services/mailService';

const userRepository = new UserRepositoryImpl();
const jwtSecret = process.env.JWT_SECRET || 'secret';

export class UserController {
  static async verifyOtp(req: Request, res: Response) {
    const { email, otp } = req.body;
    try {
      const useCase = new VerifyOtp(userRepository, jwtSecret);
      const result = await useCase.execute(email, otp);
      if (!result) return res.status(401).json({ error: 'Invalid or expired OTP' });
      res.status(200).json({ message: 'Authentication successful', token: result.token, user: { id: result.user.id, email: result.user.email } });
    } catch (err) {
      res.status(400).json({ error: 'OTP verification failed', details: err });
    }
  }
} 