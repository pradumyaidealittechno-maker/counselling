import { Request, Response } from 'express';
import Assessment from '../models/Assessment.js';

// Get assessments for a student
export const getStudentAssessments = async (req: Request, res: Response) => {
    try {
        const { studentId } = req.query;
        const filter: any = {};
        if (studentId) filter.studentId = studentId;

        const assessments = await Assessment.find(filter).sort({ createdAt: -1 });
        res.json(assessments);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get single assessment
export const getAssessmentById = async (req: Request, res: Response) => {
    try {
        const assessment = await Assessment.findById(req.params.id)
            .populate('studentId', 'firstName lastName currentGrade');
        if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
        res.json(assessment);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Assign assessment to student
export const assignAssessment = async (req: any, res: Response) => {
    try {
        const assessment = await Assessment.create({
            ...req.body,
            counsellorId: req.user.id || req.user._id,
            status: 'assigned'
        });
        res.status(201).json(assessment);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Submit assessment results
export const submitAssessment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { questionResponses, score, maxScore } = req.body;

        // Simple AI Analysis simulation for now
        const aiAnalysis = {
            strengths: ['Analytical Thinking', 'Problem Solving'],
            weaknesses: ['Speed'],
            recommendations: ['Practice more logical puzzles'],
            careerFit: ['Software Engineering', 'Data Science']
        };

        const assessment = await Assessment.findByIdAndUpdate(
            id,
            {
                questionResponses,
                score,
                maxScore,
                status: 'completed',
                completedAt: new Date(),
                aiAnalysis
            },
            { new: true }
        );

        if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
        res.json(assessment);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
