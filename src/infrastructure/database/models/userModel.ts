import mongoose, { Document } from 'mongoose';
import { VALID_ROLES, UserRole } from '../../../utils/roleUtils';

export interface UserDocument extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  otp?: string;
  otpExpiry?: Date;
}

const userSchema = new mongoose.Schema<UserDocument>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: {
      values: VALID_ROLES,
      message: '{VALUE} is not a valid role'
    },
    required: true // Role must be explicitly selected during signup - no defaults
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
    required: false,
  },
  otpExpiry: {
    type: Date,
    required: false,
  }
}, {
  timestamps: true
});

export const UserModel = mongoose.model<UserDocument>('User', userSchema); 