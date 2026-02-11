import express from 'express';
import {
    getStudentAssessments,
    getAssessmentById,
    assignAssessment,
    submitAssessment
} from '../controllers/assessmentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getStudentAssessments);
router.get('/:id', getAssessmentById);
router.post('/assign', assignAssessment);
router.post('/:id/submit', submitAssessment);

export default router;
