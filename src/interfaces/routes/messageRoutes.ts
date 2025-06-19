import { Router } from 'express';
import { MessageController } from '../controllers/messageController';

const router = Router();

router.post('/', MessageController.send);
router.get('/', MessageController.list);

export default router; 