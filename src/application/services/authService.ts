import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(payload: string | object | Buffer, secret: jwt.Secret, expiresIn: string = '1h'): string {
    const options: SignOptions = { expiresIn: expiresIn as any };
    return jwt.sign(payload, secret, options);
  }
} 
