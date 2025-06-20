import nodemailer from 'nodemailer';

// Create transporter with Gmail configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  secure: false,  
  requireTLS: true,
  logger: true,
  debug: true,

  
  auth: {
    user:'samer19alloush@gmail.com',
    pass:'ouca mkgc embx sqwc', 
  },
  // Additional Gmail configuration for better reliability
  tls: {
    rejectUnauthorized: false
  }
});

// Test the connection on startup
transporter.verify((error: any, success: any) => {
  if (error) {
    console.error('❌ Email service configuration error:', error);
    console.log('💡 Make sure your Gmail credentials are correct in .env file');
    console.log('💡 You may need to enable "Less secure app access" or use an App Password');
  } else {
    console.log('✅ Email service is ready to send emails');
  }
});

export class MailService {
  static async sendOtpEmail(to: string, otp: string) {
    try {
      const mailOptions = {
        from: `"Verification Service" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: '🔐 Your Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; text-align: center; margin-bottom: 30px;">Email Verification</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">Hello!</p>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Thank you for signing up! Please use the following verification code to complete your registration:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; background-color: #007bff; color: white; padding: 15px 30px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 3px;">
                  ${otp}
                </div>
              </div>
              <p style="color: #666; font-size: 14px; line-height: 1.6;">
                ⏰ This code will expire in <strong>30 minutes</strong>.
              </p>
              <p style="color: #666; font-size: 14px; line-height: 1.6;">
                If you didn't request this verification, please ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        `,
        text: `
Your verification code is: ${otp}

This code will expire in 30 minutes.

If you didn't request this verification, please ignore this email.
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ OTP email sent successfully to:', to);
      console.log('📧 Message ID:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Failed to send OTP email:', error);
      throw new Error('Failed to send verification email. Please try again.');
    }
  }

  static async sendEmailWithAttachments(to: string, subject: string, text: string, attachments: any[]) {
    try {
      const mailOptions = {
        from: `"Support" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        attachments
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email with attachments sent successfully to:', to);
      return info;
    } catch (error) {
      console.error('❌ Failed to send email with attachments:', error);
      throw new Error('Failed to send email. Please try again.');
    }
  }
} 