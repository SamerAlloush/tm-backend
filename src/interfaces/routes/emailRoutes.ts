import { Router } from 'express';
import multer from 'multer';
import { EmailController } from '../controllers/emailController';
import path from 'path';

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.post('/send', upload.array('attachments'), EmailController.sendEmail);

export default router; 