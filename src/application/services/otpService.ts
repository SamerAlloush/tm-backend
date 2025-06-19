export class OtpService {
  static generateOtp(length = 6): string {
    return Math.floor(100000 + Math.random() * 900000).toString().substring(0, length);
  }

  static isOtpExpired(otpExpires?: Date): boolean {
    if (!otpExpires) return true;
    return otpExpires < new Date();
  }
} 