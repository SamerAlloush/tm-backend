import { UserRepository } from '../../repositories/userRepository';
import { User } from '../../entities/user';

export class GetUserProfile {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string): Promise<User | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) return null;
    
    // Return user data without sensitive information
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roles: user.roles || ['user'],
      // Don't return password, otp, or otpExpires
      password: '', // Will be excluded in response
      otp: undefined,
      otpExpires: undefined
    };
  }
} 