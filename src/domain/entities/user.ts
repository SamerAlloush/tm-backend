export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  isVerified?: boolean;
  otp?: string;
  otpExpiry?: Date;
} 