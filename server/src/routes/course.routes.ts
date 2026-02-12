import express from 'express';
import {
    getCourses,
    createCourse,
    getCourseById,
    updateCourse,
    deleteCourse,
    generateCourseDNA
} from '../controllers/courseController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Publicly accessible list (optional, but keep authenticated for now)
router.use(authenticate);

router.get('/', getCourses);
router.post('/', createCourse);
router.get('/:id', getCourseById);
router.patch('/:id', updateCourse);
router.delete('/:id', deleteCourse);
router.post('/:id/generate-dna', generateCourseDNA);

export default router;
