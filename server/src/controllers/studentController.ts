import { Request, Response } from 'express';
import Student from '../models/Student.js';

// Create new student
export const createStudent = async (req: any, res: Response) => {
    try {
        // Handle both id and _id from user object
        const userId = req.user.id || req.user._id;

        const studentData = {
            ...req.body,
            createdBy: userId,
            counsellorId: userId // Default to creator
        };

        const student = await Student.create(studentData);
        res.status(201).json(student);
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Student with this email already exists' });
        }
        res.status(500).json({ message: error.message });
    }
};

// Get all students (optionally filtered by counsellor)
export const getStudents = async (req: Request, res: Response) => {
    try {
        const filter: any = {};
        if (req.query.grade) filter.currentGrade = req.query.grade;
        if (req.query.search) {
            filter.$or = [
                { firstName: { $regex: req.query.search, $options: 'i' } },
                { lastName: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // If regular user, only show assigned students? 
        // For now, let's allow seeing all students for collaboration

        const students = await Student.find(filter).sort({ createdAt: -1 });
        res.json(students);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get single student
export const getStudentById = async (req: Request, res: Response) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('counsellorId', 'firstName lastName email');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Update student
export const updateStudent = async (req: Request, res: Response) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Delete student
export const deleteStudent = async (req: Request, res: Response) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json({ message: 'Student deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
