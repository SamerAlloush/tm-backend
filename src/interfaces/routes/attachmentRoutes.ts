import { Router } from 'express';
import { AttachmentController } from '../controllers/attachmentController';

const router = Router();

router.post(
  '/upload',
  AttachmentController.uploadMiddleware,
  (req, res, next) => AttachmentController.upload(req, res).catch(next)
);

export default router; 