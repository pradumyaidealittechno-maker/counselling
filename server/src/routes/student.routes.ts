import express from 'express';
import {
    createStudent,
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent
} from '../controllers/studentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(authenticate);

router.post('/', createStudent);
router.get('/', getStudents);
router.get('/:id', getStudentById);
router.patch('/:id', updateStudent);
router.delete('/:id', deleteStudent);

export default router;
