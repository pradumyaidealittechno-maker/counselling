export interface Session {
    id: string;
    studentId: string;
    studentName: string;
    type: 'Career Guidance' | 'Academic Planning' | 'Personal Counselling' | 'Parent Meeting' | 'Follow-up';
    date: string;
    time: string;
    duration: string; // e.g., "45 min"
    status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';
    summary?: string;
    actionItems?: string[];
    notes?: string;
    meetingLink?: string;
}

export const MOCK_SESSIONS: Session[] = [
    {
        id: '101',
        studentId: '1',
        studentName: 'Rahul Sharma',
        type: 'Career Guidance',
        date: '2026-02-12', // Tomorrow
        time: '14:00',
        duration: '45 min',
        status: 'Scheduled',
        meetingLink: 'https://meet.google.com/abc-defg-hij'
    },
    {
        id: '102',
        studentId: '2',
        studentName: 'Priya Patel',
        type: 'Academic Planning',
        date: '2026-02-12', // Tomorrow
        time: '15:30',
        duration: '60 min',
        status: 'Scheduled',
        notes: 'Discussing subject choices for next semester.'
    },
    {
        id: '103',
        studentId: '4',
        studentName: 'Ananya Singh',
        type: 'Follow-up',
        date: '2026-02-10', // Past
        time: '10:00',
        duration: '30 min',
        status: 'Completed',
        summary: 'Student is making good progress with SAT prep. Confident about upcoming exams.',
        actionItems: ['Complete mock test 3', 'Review essay draft']
    },
    {
        id: '104',
        studentId: '5',
        studentName: 'Karthik Raj',
        type: 'Personal Counselling',
        date: '2026-02-08', // Past
        time: '11:00',
        duration: '45 min',
        status: 'Completed',
        summary: 'Addressed stress management techniques. Student seemed relieved.',
        actionItems: ['Practice breathing exercises', 'Follow study schedule']
    },
    {
        id: '105',
        studentId: '3',
        studentName: 'Arjun Reddy',
        type: 'Parent Meeting',
        date: '2026-02-15', // Future
        time: '16:00',
        duration: '60 min',
        status: 'Scheduled'
    }
];
