import { UserRepository } from '../../repositories/userRepository';
import { User } from '../../entities/user';
import { AuthService } from '../../../application/services/authService';

export class VerifyOtp {
  constructor(private userRepository: UserRepository, private jwtSecret: string) {}

  async execute(email: string, otp: string): Promise<{ token: string; user: User } | null> {
    const isValid = await this.userRepository.verifyOtp(email, otp);
    if (!isValid) return null;
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;
    const token = AuthService.generateToken({ id: user.id, email: user.email, roles: user.roles }, this.jwtSecret);
    return { token, user };
  }
} 