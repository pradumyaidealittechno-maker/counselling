import express from 'express';
import {
    getSessions,
    scheduleSession,
    getSessionById,
    updateSession,
    deleteSession
} from '../controllers/sessionController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(authenticate);

router.get('/', getSessions);
router.post('/', scheduleSession);
router.get('/:id', getSessionById);
router.patch('/:id', updateSession);
router.delete('/:id', deleteSession);

export default router;
