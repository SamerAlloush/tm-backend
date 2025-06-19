import mongoose, { Document, Schema } from 'mongoose';

export interface UserDocument extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  otp?: string;
  otpExpires?: Date;
  roles?: string[];
}

const UserSchema = new Schema<UserDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  otp: { type: String },
  otpExpires: { type: Date },
  roles: [{ type: String }],
});

export const UserModel = mongoose.model<UserDocument>('User', UserSchema); 