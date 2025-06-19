import { UserRepository } from '../../repositories/userRepository';
import { AuthService } from '../../../application/services/authService';
import { OtpService } from '../../../application/services/otpService';
import { User } from '../../entities/user';

export class LoginUser {
  constructor(private userRepository: UserRepository) {}

  async execute(identifier: string, password: string): Promise<{ user: User; otp: string } | null> {
    // identifier can be email or phone
    let user = await this.userRepository.findByEmail(identifier);
    if (!user && this.userRepository.findByPhone) {
      user = await this.userRepository.findByPhone(identifier);
    }
    if (!user) return null;
    const isMatch = await AuthService.comparePassword(password, user.password);
    if (!isMatch) return null;
    const otp = OtpService.generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await this.userRepository.setOtp(user.email, otp, otpExpires);
    return { user, otp };
  }
} 