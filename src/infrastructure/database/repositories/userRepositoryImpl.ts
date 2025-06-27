import { UserRepository } from '../../../domain/repositories/userRepository';
import { User } from '../../../domain/entities/user';
import { UserModel } from '../models/userModel';

export class UserRepositoryImpl implements UserRepository {
  private toUser(obj: any): User {
    console.log('Converting DB object to User:', obj);
    const user = {
      ...obj,
      id: String(obj._id),
      role: obj.role,
    };
    console.log('Converted User object:', user);
    return user;
  }

  async create(user: User): Promise<User> {
    const created = await UserModel.create(user);
    return this.toUser(created.toObject());
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    if (!user) return null;
    return this.toUser(user.toObject());
  }

  async findById(id: string): Promise<User | null> {
    console.log('Finding user by ID:', id);
    const user = await UserModel.findById(id);
    console.log('Found user in DB:', user);
    if (!user) return null;
    return this.toUser(user.toObject());
  }

  async update(user: User): Promise<User> {
    const updated = await UserModel.findByIdAndUpdate(user.id, user, { new: true });
    if (!updated) throw new Error('User not found');
    return this.toUser(updated.toObject());
  }

  async delete(id: string): Promise<void> {
    await UserModel.findByIdAndDelete(id);
  }

  async setOtp(email: string, otp: string, otpExpiry: Date): Promise<void> {
    await UserModel.updateOne({ email }, { otp, otpExpiry });
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const user = await UserModel.findOne({ email, otp });
    if (!user || !user.otpExpiry || user.otpExpiry < new Date()) return false;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.isVerified = true;
    await user.save();
    return true;
  }

  async findByPhone(phone: string): Promise<User | null> {
    const user = await UserModel.findOne({ phone });
    if (!user) return null;
    return this.toUser(user.toObject());
  }
} 