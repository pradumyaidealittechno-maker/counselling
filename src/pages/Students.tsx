import { useState, useEffect } from 'react';
import { Plus, Search, Calendar, TrendingUp, Users, Clock, BookOpen, GraduationCap, School, FileText, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Students() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<any[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [gradeFilter, setGradeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [availableCourses, setAvailableCourses] = useState<any[]>([]);
    const [newStudent, setNewStudent] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        currentGrade: '11th',
        currentSchool: '',
        currentBoard: 'CBSE',
        enrolledCourse: ''
    });

    useEffect(() => {
        fetchStudents();
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const data = await api.courses.getAll();
            setAvailableCourses(data);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        }
    };

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const data = await api.students.getAll();
            setStudents(data);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Create student in DB
            const student = await api.students.create(newStudent);

            // 2. Trigger Counseling Webhook with both Student and Course data
            try {
                const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_COUNSELLING;
                if (webhookUrl) {
                    // Find course details from the title
                    const enrolledCourseData = availableCourses.find(c => c.title === newStudent.enrolledCourse);

                    await fetch(webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            event: 'student_added',
                            timestamp: new Date().toISOString(),
                            student: student,
                            course: enrolledCourseData || { title: newStudent.enrolledCourse }
                        })
                    });
                }
            } catch (webhookError) {
                console.error('Webhook notification failed:', webhookError);
            }

            // 3. Refresh list and close modal
            setIsAddModalOpen(false);
            fetchStudents();
            setNewStudent({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                currentGrade: '11th',
                currentSchool: '',
                currentBoard: 'CBSE',
                enrolledCourse: ''
            });
            alert('Student added successfully!');
        } catch (error: any) {
            console.error('Failed to add student:', error);
            alert(error.message || 'Failed to add student');
        } finally {
            setLoading(false);
        }
    };

    // Filter students
    const filteredStudents = students.filter((student: any) => {
        const matchesSearch =
            student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesGrade = gradeFilter === 'all' || student.currentGrade === gradeFilter;
        const matchesStatus = statusFilter === 'all' || student.status === statusFilter;

        return matchesSearch && matchesGrade && matchesStatus;
    });

    // Calculate stats
    const stats = {
        totalStudents: students.length,
        activeSessions: students.filter((s: any) => s.nextSessionDate).length,
        sessionsThisWeek: students.filter((s: any) => {
            if (!s.nextSessionDate) return false;
            const sessionDate = new Date(s.nextSessionDate);
            const today = new Date();
            const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            return sessionDate >= today && sessionDate <= weekFromNow;
        }).length,
        pendingFollowUps: students.filter((s: any) => s.status === 'pending').length
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Not scheduled';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
    };

    const getGradeColor = (grade: string) => {
        if (grade === '12th') return { bg: 'var(--error-50)', text: 'var(--error-700)' };
        if (grade === '11th') return { bg: 'var(--warning-50)', text: 'var(--warning-700)' };
        return { bg: 'var(--blue-50)', text: 'var(--blue-700)' };
    };

    return (
        <div style={{ width: '100%', minHeight: '100%' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem', padding: '2rem 2rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <GraduationCap size={32} style={{ color: 'var(--primary-600)' }} />
                            Students
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                            Manage and track your students' academic journey
                        </p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={18} />
                        Add Student
                    </button>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '1.5rem',
                        borderRadius: '1rem',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Students</p>
                                <p style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totalStudents}</p>
                                <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>Enrolled this year</p>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                                <Users size={28} />
                            </div>
                        </div>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        padding: '1.5rem',
                        borderRadius: '1rem',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(240, 147, 251, 0.25)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Active Sessions</p>
                                <p style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.activeSessions}</p>
                                <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>Scheduled this month</p>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                                <Calendar size={28} />
                            </div>
                        </div>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        padding: '1.5rem',
                        borderRadius: '1rem',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(79, 172, 254, 0.25)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Sessions This Week</p>
                                <p style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.sessionsThisWeek}</p>
                                <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>+2 from last week</p>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                                <TrendingUp size={28} />
                            </div>
                        </div>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                        padding: '1.5rem',
                        borderRadius: '1rem',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(250, 112, 154, 0.25)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Pending Follow-ups</p>
                                <p style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.pendingFollowUps}</p>
                                <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>Requires attention</p>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                                <Clock size={28} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid var(--gray-200)', margin: '0 2rem 1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1rem', alignItems: 'center' }}>
                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                        <input
                            type="text"
                            placeholder="Search by name, email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 3rem',
                                border: '1px solid var(--gray-300)',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                outline: 'none',
                                transition: 'border 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary-500)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--gray-300)'}
                        />
                    </div>

                    {/* Grade Filter */}
                    <select
                        value={gradeFilter}
                        onChange={(e) => setGradeFilter(e.target.value)}
                        style={{
                            padding: '0.75rem 1rem',
                            border: '1px solid var(--gray-300)',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            minWidth: '150px',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">All Grades</option>
                        <option value="10th">10th Grade</option>
                        <option value="11th">11th Grade</option>
                        <option value="12th">12th Grade</option>
                        <option value="Undergraduate">Undergraduate</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            padding: '0.75rem 1rem',
                            border: '1px solid var(--gray-300)',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            minWidth: '150px',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="graduated">Graduated</option>
                    </select>
                </div>
            </div>

            {/* Students Table */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <Loader size={48} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary-600)' }} />
                </div>
            ) : (
                <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid var(--gray-200)', margin: '0 2rem 2rem' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--gray-50)' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Grade & School</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enrolled Course</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Session</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((student: any, idx: number) => {
                                    const gradeColors = getGradeColor(student.currentGrade);
                                    return (
                                        <tr
                                            key={student.id}
                                            style={{
                                                borderBottom: idx !== filteredStudents.length - 1 ? '1px solid var(--gray-200)' : 'none',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                            onClick={() => navigate(`/dashboard/students/${student.id}`)}
                                        >
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div
                                                        style={{
                                                            width: '48px',
                                                            height: '48px',
                                                            borderRadius: '50%',
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'white',
                                                            fontWeight: 700,
                                                            fontSize: '1rem',
                                                            flexShrink: 0
                                                        }}
                                                    >
                                                        {getInitials(student.firstName, student.lastName)}
                                                    </div>
                                                    <div style={{ minWidth: 0 }}>
                                                        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
                                                            {student.firstName} {student.lastName}
                                                        </p>
                                                        <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                        <span style={{
                                                            padding: '0.25rem 0.75rem',
                                                            background: gradeColors.bg,
                                                            color: gradeColors.text,
                                                            borderRadius: '0.5rem',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600
                                                        }}>
                                                            {student.currentGrade}
                                                        </span>
                                                    </div>
                                                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <School size={14} />
                                                        {student.currentSchool}
                                                    </p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{student.currentBoard} Board</p>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {student.enrolledCourse ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <BookOpen size={14} style={{ color: 'var(--primary-500)' }} />
                                                        <span style={{ fontSize: '0.875rem', color: 'var(--gray-700)', fontWeight: 500 }}>
                                                            {student.enrolledCourse}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontStyle: 'italic' }}>
                                                        None
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <div style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '46px',
                                                    height: '46px',
                                                    borderRadius: '50%',
                                                    background: (student.overallScore || 0) >= 85 ? 'var(--success-50)' : (student.overallScore || 0) >= 70 ? 'var(--warning-50)' : 'var(--error-50)',
                                                    border: `2px solid ${(student.overallScore || 0) >= 85 ? 'var(--success-500)' : (student.overallScore || 0) >= 70 ? 'var(--warning-500)' : 'var(--error-500)'}`,
                                                    fontWeight: 700,
                                                    fontSize: '0.875rem',
                                                    color: (student.overallScore || 0) >= 85 ? 'var(--success-700)' : (student.overallScore || 0) >= 70 ? 'var(--warning-700)' : 'var(--error-700)'
                                                }}>
                                                    {student.overallScore}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Clock size={14} style={{ color: 'var(--gray-400)' }} />
                                                    {formatDate(student.lastSessionDate)}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/dashboard/students/${student.id}`);
                                                        }}
                                                        className="btn btn-sm btn-ghost"
                                                        style={{ padding: '0.5rem' }}
                                                        title="View Profile"
                                                    >
                                                        <FileText size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/dashboard/sessions/schedule?studentId=${student.id}`);
                                                        }}
                                                        className="btn btn-sm btn-primary"
                                                        style={{ fontSize: '0.75rem', padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
                                                    >
                                                        <Calendar size={14} />
                                                        Schedule
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {filteredStudents.length === 0 && (
                        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                            <BookOpen size={64} style={{ color: 'var(--gray-300)', margin: '0 auto 1rem' }} />
                            <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '0.5rem' }}>No students found</p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add Student Modal */}
            {isAddModalOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '1rem',
                        width: '100%',
                        maxWidth: '600px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        padding: '2rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>Add New Student</h2>
                            <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--gray-500)' }}>&times;</button>
                        </div>

                        <form onSubmit={handleAddStudent}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>First Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newStudent.firstName}
                                        onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--gray-300)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newStudent.lastName}
                                        onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--gray-300)' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={newStudent.email}
                                        onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--gray-300)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        value={newStudent.phone}
                                        onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--gray-300)' }}
                                        placeholder="+91..."
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>Current Grade</label>
                                    <select
                                        value={newStudent.currentGrade}
                                        onChange={(e) => setNewStudent({ ...newStudent, currentGrade: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--gray-300)' }}
                                    >
                                        <option value="10th">10th</option>
                                        <option value="11th">11th</option>
                                        <option value="12th">12th</option>
                                        <option value="Undergraduate">Undergraduate</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>Current Board</label>
                                    <select
                                        value={newStudent.currentBoard}
                                        onChange={(e) => setNewStudent({ ...newStudent, currentBoard: e.target.value })}
                                        style={{ width: '100', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--gray-300)' }}
                                    >
                                        <option value="CBSE">CBSE</option>
                                        <option value="ICSE">ICSE</option>
                                        <option value="IB">IB</option>
                                        <option value="State Board">State Board</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>Select Course</label>
                                <select
                                    required
                                    value={newStudent.enrolledCourse}
                                    onChange={(e) => setNewStudent({ ...newStudent, enrolledCourse: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--gray-300)' }}
                                >
                                    <option value="" disabled>Select a course</option>
                                    {availableCourses.length > 0 ? (
                                        availableCourses.map((course) => (
                                            <option key={course._id} value={course.title}>{course.title}</option>
                                        ))
                                    ) : (
                                        <option disabled>No courses available</option>
                                    )}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="btn btn-ghost"
                                    style={{ flex: 1 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ flex: 1 }}
                                >
                                    Add Student
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
