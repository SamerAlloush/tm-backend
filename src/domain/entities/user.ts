export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  otp?: string;
  otpExpires?: Date;
  roles?: string[];
} 