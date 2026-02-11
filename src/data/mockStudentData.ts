export interface Student {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    currentGrade: string;
    currentSchool: string;
    currentBoard: string;
    status: 'active' | 'inactive' | 'graduated';
    lastSessionDate: string | null;
    nextSessionDate: string | null;
    enrollmentDate: string;
    totalSessions: number;
    careerInterests: string[];
    overallScore: number;
}

export const MOCK_STUDENTS: Student[] = [
    {
        id: '1',
        firstName: 'Rahul',
        lastName: 'Sharma',
        email: 'rahul.sharma@email.com',
        phone: '+91 98765 43210',
        currentGrade: '12th',
        currentSchool: 'Delhi Public School',
        currentBoard: 'CBSE',
        status: 'active',
        lastSessionDate: '2026-02-08',
        nextSessionDate: '2026-02-15',
        enrollmentDate: '2025-09-01',
        totalSessions: 12,
        careerInterests: ['Engineering', 'Technology'],
        overallScore: 85
    },
    {
        id: '2',
        firstName: 'Priya',
        lastName: 'Patel',
        email: 'priya.patel@email.com',
        phone: '+91 98765 43211',
        currentGrade: '11th',
        currentSchool: 'Ryan International School',
        currentBoard: 'CBSE',
        status: 'active',
        lastSessionDate: '2026-02-10',
        nextSessionDate: '2026-02-17',
        enrollmentDate: '2025-08-15',
        totalSessions: 8,
        careerInterests: ['Medicine', 'Healthcare'],
        overallScore: 92
    },
    {
        id: '3',
        firstName: 'Arjun',
        lastName: 'Reddy',
        email: 'arjun.reddy@email.com',
        phone: '+91 98765 43212',
        currentGrade: '10th',
        currentSchool: 'Kendriya Vidyalaya',
        currentBoard: 'CBSE',
        status: 'active',
        lastSessionDate: '2026-02-05',
        nextSessionDate: null,
        enrollmentDate: '2025-10-01',
        totalSessions: 5,
        careerInterests: ['Commerce', 'Business'],
        overallScore: 78
    },
    {
        id: '4',
        firstName: 'Ananya',
        lastName: 'Singh',
        email: 'ananya.singh@email.com',
        phone: '+91 98765 43213',
        currentGrade: '12th',
        currentSchool: 'Modern School',
        currentBoard: 'ICSE',
        status: 'active',
        lastSessionDate: '2026-02-09',
        nextSessionDate: '2026-02-14',
        enrollmentDate: '2025-07-20',
        totalSessions: 15,
        careerInterests: ['Arts', 'Design', 'Media'],
        overallScore: 88
    },
    {
        id: '5',
        firstName: 'Karthik',
        lastName: 'Raj',
        email: 'karthik.raj@email.com',
        phone: '+91 98765 43214',
        currentGrade: '11th',
        currentSchool: 'DAV Public School',
        currentBoard: 'CBSE',
        status: 'active',
        lastSessionDate: '2026-02-07',
        nextSessionDate: '2026-02-18',
        enrollmentDate: '2025-09-10',
        totalSessions: 9,
        careerInterests: ['Science', 'Research'],
        overallScore: 90
    }
];
