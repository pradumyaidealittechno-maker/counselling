import { Request, Response } from 'express';
import Course from '../models/Course.js';

// Create new course
export const createCourse = async (req: any, res: Response) => {
    try {
        const course = await Course.create({
            ...req.body,
            createdBy: req.user.id || req.user._id
        });
        res.status(201).json(course);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get all courses
export const getCourses = async (req: Request, res: Response) => {
    try {
        const filter: any = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.category) filter.category = req.query.category;
        if (req.query.level) filter.level = req.query.level;

        const courses = await Course.find(filter).sort({ createdAt: -1 });
        res.json(courses);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get single course
export const getCourseById = async (req: Request, res: Response) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Update course
export const updateCourse = async (req: Request, res: Response) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Delete course
export const deleteCourse = async (req: Request, res: Response) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json({ message: 'Course deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
