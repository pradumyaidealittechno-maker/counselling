import { Request, Response } from 'express';
import Course from '../models/Course.js';

// Create new course
export const createCourse = async (req: any, res: Response) => {
    try {
        console.log('📚 [CourseController] Creating course request body:', JSON.stringify(req.body, null, 2));
        console.log('👤 [CourseController] User from request:', JSON.stringify(req.user, null, 2));

        const { title, description, category, duration, level, prerequisites, contextFileContent, audioUrl } = req.body;

        // Ensure required fields are present and map to schema
        const courseData = {
            title,
            description,
            category,
            duration,
            level: (level || 'beginner').toLowerCase(),
            prerequisites,
            contextFileContent,
            audioUrl,
            createdBy: req.user?.id || req.user?._id
        };

        console.log('📝 [CourseController] Final course data for Mongoose:', JSON.stringify(courseData, null, 2));

        const course = await Course.create(courseData);

        console.log('✅ [CourseController] Course created successfully:', course._id);
        res.status(201).json(course);
    } catch (error: any) {
        console.error('❌ [CourseController] Create error details:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            return res.status(400).json({ message: `Validation Error: ${messages.join(', ')}` });
        }

        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

// Get all courses
export const getCourses = async (req: Request, res: Response) => {
    try {
        const filter: any = {};
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
