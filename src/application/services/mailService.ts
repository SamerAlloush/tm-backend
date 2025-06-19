import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export class MailService {
  static async sendOtpEmail(to: string, otp: string) {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`,
    });
  }

  static async sendEmailWithAttachments(to: string, subject: string, text: string, attachments: any[]) {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      attachments
    });
  }
} 