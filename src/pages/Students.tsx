import { useState } from 'react';
import { Plus, Search, Calendar, TrendingUp, Users, Clock, BookOpen, GraduationCap, School, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_STUDENTS } from '../data/mockStudentData';

export default function Students() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [gradeFilter, setGradeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Filter students
    const filteredStudents = MOCK_STUDENTS.filter(student => {
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
        totalStudents: MOCK_STUDENTS.length,
        activeSessions: MOCK_STUDENTS.filter(s => s.nextSessionDate).length,
        sessionsThisWeek: 8,
        pendingFollowUps: 3
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
                        onClick={() => navigate('/dashboard/students/new')}
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
            <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid var(--gray-200)', margin: '0 2rem 2rem' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--gray-50)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Grade & School</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Career Interest</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Session</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Next Session</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student, idx) => {
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
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                                {student.careerInterests.slice(0, 2).map((interest, i) => (
                                                    <span
                                                        key={i}
                                                        style={{
                                                            padding: '0.25rem 0.75rem',
                                                            background: 'var(--blue-50)',
                                                            color: 'var(--blue-700)',
                                                            borderRadius: '0.375rem',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 500,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem'
                                                        }}
                                                    >
                                                        <Target size={12} />
                                                        {interest}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '56px',
                                                height: '56px',
                                                borderRadius: '50%',
                                                background: student.overallScore >= 85 ? 'var(--success-50)' : student.overallScore >= 70 ? 'var(--warning-50)' : 'var(--error-50)',
                                                border: `3px solid ${student.overallScore >= 85 ? 'var(--success-500)' : student.overallScore >= 70 ? 'var(--warning-500)' : 'var(--error-500)'}`,
                                                fontWeight: 700,
                                                fontSize: '1rem',
                                                color: student.overallScore >= 85 ? 'var(--success-700)' : student.overallScore >= 70 ? 'var(--warning-700)' : 'var(--error-700)'
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
                                            {student.nextSessionDate ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Calendar size={14} style={{ color: 'var(--success-500)' }} />
                                                    <span style={{ fontSize: '0.875rem', color: 'var(--success-600)', fontWeight: 500 }}>
                                                        {formatDate(student.nextSessionDate)}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontStyle: 'italic' }}>
                                                    Not scheduled
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
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
        </div>
    );
}
