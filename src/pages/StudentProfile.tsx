import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Calendar, TrendingUp, BookOpen, Target, Award, Clock } from 'lucide-react';
import { MOCK_STUDENTS } from '../data/mockStudentData';

export default function StudentProfile() {
    const { id } = useParams();
    const navigate = useNavigate();

    const student = MOCK_STUDENTS.find(s => s.id === id);

    if (!student) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ fontSize: '1.125rem', color: 'var(--gray-600)' }}>Student not found</p>
                <button
                    onClick={() => navigate('/dashboard/students')}
                    className="btn btn-primary"
                    style={{ marginTop: '1rem' }}
                >
                    Back to Students
                </button>
            </div>
        );
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Not scheduled';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <button
                onClick={() => navigate('/dashboard/students')}
                className="btn btn-ghost"
                style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
                <ArrowLeft size={18} />
                Back to Students
            </button>

            {/* Student Info Card */}
            <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid var(--gray-200)', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'start', flexWrap: 'wrap' }}>
                    <div
                        style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '2.5rem',
                            flexShrink: 0
                        }}
                    >
                        {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                            {student.firstName} {student.lastName}
                        </h1>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Mail size={16} style={{ color: 'var(--gray-400)' }} />
                                <span style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>{student.email}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Phone size={16} style={{ color: 'var(--gray-400)' }} />
                                <span style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>{student.phone}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Calendar size={16} style={{ color: 'var(--gray-400)' }} />
                                <span style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                                    Enrolled: {formatDate(student.enrollmentDate)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid var(--gray-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: 'var(--blue-50)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                            <BookOpen size={24} style={{ color: 'var(--blue-600)' }} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>Current Grade</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>{student.currentGrade}</p>
                        </div>
                    </div>
                </div>

                <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid var(--gray-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: 'var(--success-50)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                            <Award size={24} style={{ color: 'var(--success-600)' }} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>Overall Score</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>{student.overallScore}%</p>
                        </div>
                    </div>
                </div>

                <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid var(--gray-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: 'var(--purple-50)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                            <Clock size={24} style={{ color: 'var(--purple-600)' }} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>Total Sessions</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>{student.totalSessions}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Academic Info */}
                <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid var(--gray-200)' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '1.5rem' }}>
                        Academic Information
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>School</p>
                            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-900)' }}>{student.currentSchool}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>Board</p>
                            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-900)' }}>{student.currentBoard}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>Status</p>
                            <span style={{
                                display: 'inline-block',
                                padding: '0.25rem 0.75rem',
                                background: 'var(--success-50)',
                                color: 'var(--success-700)',
                                borderRadius: '0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textTransform: 'capitalize'
                            }}>
                                {student.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Career Interests */}
                <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid var(--gray-200)' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Target size={20} />
                        Career Interests
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {student.careerInterests.map((interest, idx) => (
                            <span
                                key={idx}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: 'var(--blue-50)',
                                    color: 'var(--blue-700)',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: 500
                                }}
                            >
                                {interest}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Session Info */}
                <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid var(--gray-200)' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '1.5rem' }}>
                        Session Information
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>Last Session</p>
                            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-900)' }}>{formatDate(student.lastSessionDate)}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>Next Session</p>
                            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: student.nextSessionDate ? 'var(--success-600)' : 'var(--gray-500)' }}>
                                {formatDate(student.nextSessionDate)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
