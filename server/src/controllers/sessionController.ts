import { Request, Response } from 'express';
import CounsellingSession from '../models/CounsellingSession.js';

// Schedule new session
export const scheduleSession = async (req: any, res: Response) => {
    try {
        const sessionData = {
            ...req.body,
            counsellorId: req.user.id || req.user._id, // Assign to current user (counsellor)
            status: 'scheduled'
        };

        const session = await CounsellingSession.create(sessionData);
        res.status(201).json(session);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get sessions (filtered by counsellor, student, date)
export const getSessions = async (req: any, res: Response) => {
    try {
        const filter: any = {};
        const userId = req.user.id || req.user._id;

        // Filter by counsellor - only show sessions assigned to current user
        filter.counsellorId = userId;

        if (req.query.studentId && typeof req.query.studentId === 'string' && req.query.studentId !== 'undefined' && req.query.studentId !== 'null') {
            if (req.query.studentId.match(/^[0-9a-fA-F]{24}$/)) {
                filter.studentId = req.query.studentId;
            }
        }
        if (req.query.status && req.query.status !== 'undefined') filter.status = req.query.status;
        if (req.query.date && req.query.date !== 'undefined') {
            const date = new Date(req.query.date as string);
            if (!isNaN(date.getTime())) {
                const nextDay = new Date(date);
                nextDay.setDate(date.getDate() + 1);
                filter.scheduledAt = { $gte: date, $lt: nextDay };
            }
        }

        // Add logic to restrict students to see only their sessions if user is student

        const sessions = await CounsellingSession.find(filter)
            .populate('studentId', 'firstName lastName email currentGrade')
            .populate('counsellorId', 'firstName lastName email')
            .sort({ scheduledAt: 1 });

        res.json(sessions);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get single session
export const getSessionById = async (req: Request, res: Response) => {
    try {
        if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(404).json({ message: 'Session not found' });
        }
        const session = await CounsellingSession.findById(req.params.id)
            .populate('studentId', 'firstName lastName email')
            .populate('counsellorId', 'firstName lastName email');

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }
        res.json(session);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Update session (reschedule, notes, staus)
export const updateSession = async (req: Request, res: Response) => {
    try {
        const session = await CounsellingSession.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }
        res.json(session);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Delete/Cancel session
export const deleteSession = async (req: Request, res: Response) => {
    try {
        const session = await CounsellingSession.findByIdAndDelete(req.params.id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }
        res.json({ message: 'Session deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
