import { Request, Response } from 'express';
import { MailService } from '../../application/services/mailService';
import path from 'path';

export class EmailController {
  static async sendEmail(req: Request, res: Response) {
    try {
      const { to, subject, text } = req.body;
      const files = req.files as Express.Multer.File[];
      const attachments = files ? files.map(file => ({
        filename: file.originalname,
        path: file.path,
        contentType: file.mimetype
      })) : [];
      await MailService.sendEmailWithAttachments(to, subject, text, attachments);
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send email', details: error });
    }
  }
} 