import { Response } from 'express';
import Student from '../models/Student.js';
import CounsellingSession from '../models/CounsellingSession.js';

export const getCounsellingStats = async (req: any, res: Response) => {
    try {
        const userId = req.user.id || req.user._id;

        // Total Students across system (or filter by counsellor if needed)
        const totalStudents = await Student.countDocuments();

        // Active Sessions (Scheduled or In Progress)
        const totalSessions = await CounsellingSession.countDocuments({
            counsellorId: userId
        });

        const upcomingSessionsCount = await CounsellingSession.countDocuments({
            counsellorId: userId,
            status: { $in: ['scheduled', 'in_progress'] }
        });

        const completedSessionsCount = await CounsellingSession.countDocuments({
            counsellorId: userId,
            status: 'completed'
        });

        // Sessions by month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const sessionsByMonth = await CounsellingSession.aggregate([
            {
                $match: {
                    counsellorId: userId,
                    scheduledAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: { $month: "$scheduledAt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Student Grade breakdown
        const gradeBreakdown = await Student.aggregate([
            { $group: { _id: "$currentGrade", count: { $sum: 1 } } }
        ]);

        res.json({
            stats: {
                totalStudents,
                totalSessions,
                upcomingSessions: upcomingSessionsCount,
                completedSessions: completedSessionsCount,
                engagementRate: 85, // Mock for now
            },
            sessionsByMonth: sessionsByMonth.map(item => ({
                month: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(0, item._id - 1)),
                count: item.count
            })),
            gradeBreakdown: gradeBreakdown.map(item => ({
                grade: item._id,
                count: item.count
            }))
        });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
