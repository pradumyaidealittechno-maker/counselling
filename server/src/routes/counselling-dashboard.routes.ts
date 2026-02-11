import express from 'express';
import { getCounsellingStats } from '../controllers/counsellingDashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/stats', getCounsellingStats);

export default router;
