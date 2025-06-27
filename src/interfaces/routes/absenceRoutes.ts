import { Router } from 'express';
import { submitAbsence } from '../controllers/absenceController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateToken, submitAbsence);

export default router; 