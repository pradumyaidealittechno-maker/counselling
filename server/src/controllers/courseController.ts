import { Request, Response } from 'express';
import Course from '../models/Course.js';
import aiService from '../services/ai.service.js';

// ... (existing code)

// Analyze Course Audio
export const analyzeCourseAudio = async (req: any, res: Response) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'No audio file uploaded' });
        }

        console.log('🎙️ [CourseController] Analyzing audio:', file.originalname);

        // 1. Transcribe the audio
        const transcript = await aiService.transcribeAudio(file.buffer, file.originalname);

        // 2. Extract details
        const extractedDetails = await aiService.extractCourseDetailsFromTranscript(transcript);

        res.json({
            success: true,
            transcript,
            extractedDetails
        });
    } catch (error: any) {
        console.error('❌ [CourseController] Audio analysis error:', error);
        res.status(500).json({ message: error.message || 'Failed to analyze audio' });
    }
};

// ... (existing code)
export const generateCourseDNA = async (req: Request, res: Response) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const courseDNA = await aiService.generateCourseDNA({
            title: course.title,
            description: course.description,
            category: course.category,
            level: course.level,
            prerequisites: course.prerequisites,
            fees: course.fees,
            syllabus: course.syllabus,
            transcript: course.audioTranscript
        });

        course.courseDNA = courseDNA;
        await course.save();

        res.json({ courseDNA });
    } catch (error: any) {
        console.error('Generate Course DNA error:', error);
        res.status(500).json({ message: 'Failed to generate Course DNA' });
    }
};

// Create new course
export const createCourse = async (req: any, res: Response) => {
    try {
        const { title, description, category, duration, level, prerequisites, contextFileContent, audioUrl, resources, fees, syllabus } = req.body;

        const course = new Course({
            title,
            description,
            category,
            duration,
            level: (level || 'beginner').toLowerCase(),
            prerequisites,
            contextFileContent,
            audioUrl,
            resources: resources || [],
            fees,
            syllabus,
            createdBy: req.user._id
        });

        await course.save();
        res.status(201).json(course);
    } catch (error: any) {
        console.error('Create course error:', error);
        res.status(500).json({ message: error.message || 'Failed to create course' });
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
