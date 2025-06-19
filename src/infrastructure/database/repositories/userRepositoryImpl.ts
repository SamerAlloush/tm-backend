import { UserRepository } from '../../../domain/repositories/userRepository';
import { User } from '../../../domain/entities/user';
import { UserModel } from '../models/userModel';

export class UserRepositoryImpl implements UserRepository {
  async create(user: User): Promise<User> {
    const created = await UserModel.create(user);
    const obj = created.toObject();
    return { ...obj, id: String(obj._id), phone: obj.phone };
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    if (!user) return null;
    const obj = user.toObject();
    return { ...obj, id: String(obj._id), phone: obj.phone };
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);
    if (!user) return null;
    const obj = user.toObject();
    return { ...obj, id: String(obj._id), phone: obj.phone };
  }

  async update(user: User): Promise<User> {
    const updated = await UserModel.findByIdAndUpdate(user.id, user, { new: true });
    const obj = updated!.toObject();
    return { ...obj, id: String(obj._id), phone: obj.phone };
  }

  async delete(id: string): Promise<void> {
    await UserModel.findByIdAndDelete(id);
  }

  async setOtp(email: string, otp: string, otpExpires: Date): Promise<void> {
    await UserModel.updateOne({ email }, { otp, otpExpires });
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const user = await UserModel.findOne({ email, otp });
    if (!user || !user.otpExpires || user.otpExpires < new Date()) return false;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    return true;
  }

  async findByPhone(phone: string): Promise<User | null> {
    const user = await UserModel.findOne({ phone });
    if (!user) return null;
    const obj = user.toObject();
    return { ...obj, id: String(obj._id), phone: obj.phone };
  }
} 