import { UserRepository } from '../../repositories/userRepository';
import { AuthService } from '../../../application/services/authService';
import { OtpService } from '../../../application/services/otpService';
import { User } from '../../entities/user';

export class RegisterUser {
  constructor(private userRepository: UserRepository) {}

  async execute(name: string, email: string, phone: string, password: string): Promise<{ user: User; otp: string }> {
    const hashedPassword = await AuthService.hashPassword(password);
    const otp = OtpService.generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const user: User = {
      id: '',
      name,
      email,
      phone,
      password: hashedPassword,
      otp,
      otpExpires,
      roles: ['user'],
    };
    const createdUser = await this.userRepository.create(user);
    await this.userRepository.setOtp(email, otp, otpExpires);
    return { user: createdUser, otp };
  }
} 