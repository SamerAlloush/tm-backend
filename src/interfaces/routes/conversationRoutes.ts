import { Router } from 'express';
import { ConversationController } from '../controllers/conversationController';

const router = Router();

router.post('/', ConversationController.create);
router.get('/', ConversationController.list);

export default router; 