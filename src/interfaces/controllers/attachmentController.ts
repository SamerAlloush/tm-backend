import { Request, Response } from 'express';
import { AttachmentRepositoryImpl } from '../../infrastructure/database/repositories/attachmentRepositoryImpl';
import { UploadAttachment } from '../../domain/usecases/attachment/uploadAttachment';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });
const attachmentRepo = new AttachmentRepositoryImpl();

export class AttachmentController {
  static uploadMiddleware = upload.single('file');

  static async upload(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    const { originalname, filename, mimetype } = req.file;
    const url = `/uploads/${filename}`;
    const type = mimetype.startsWith('image') ? 'image' : mimetype === 'application/pdf' ? 'pdf' : 'other';
    const uploadedBy = req.body.uploadedBy;
    try {
      const useCase = new UploadAttachment(attachmentRepo);
      const attachment = await useCase.execute(originalname, url, type, uploadedBy);
      res.status(201).json(attachment);
    } catch (err) {
      res.status(400).json({ error: 'Failed to upload attachment', details: err });
    }
  }
} 