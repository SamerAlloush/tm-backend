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
      role: user.role, // Keep exact role, no defaults
      isVerified: user.isVerified || false,
      // Don't return password, otp, or otpExpiry
      password: '', // Will be excluded in response
      otp: undefined,
      otpExpiry: undefined
    };
  }
} 