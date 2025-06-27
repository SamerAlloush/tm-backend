import { User } from '../entities/user';

export interface UserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  setOtp(email: string, otp: string, otpExpiry: Date): Promise<void>;
  verifyOtp(email: string, otp: string): Promise<boolean>;
  findByPhone?(phone: string): Promise<User | null>;
} 