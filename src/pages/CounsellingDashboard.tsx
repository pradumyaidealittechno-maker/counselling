import { Calendar, Users, BarChart3, Clock, ArrowRight, TrendingUp, BookOpen, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CounsellingDashboard() {
    const navigate = useNavigate();

    const todaysSessions = [
        { id: 1, studentName: 'Rahul Sharma', type: 'Career Guidance', time: '2:00 PM', duration: '45 min', status: 'Scheduled' },
        { id: 2, studentName: 'Priya Patel', type: 'Academic Planning', time: '3:30 PM', duration: '60 min', status: 'Scheduled' },
        { id: 3, studentName: 'Arjun Reddy', type: 'Follow-up', time: '5:00 PM', duration: '30 min', status: 'Confirmed' }
    ];

    const topPerformers = [
        { id: 1, name: 'Priya Patel', grade: '11th', sessions: 8, score: 92 },
        { id: 2, name: 'Karthik Raj', grade: '11th', sessions: 9, score: 90 },
        { id: 3, name: 'Ananya Singh', grade: '12th', sessions: 15, score: 88 }
    ];

    const recentActivity = [
        { id: 1, student: 'Ananya Singh', action: 'Completed Career Guidance session', time: '2 hours ago', icon: Calendar },
        { id: 2, student: 'Rahul Sharma', action: 'Submitted assessment form', time: '5 hours ago', icon: BarChart3 },
        { id: 3, student: 'Karthik Raj', action: 'Uploaded career preference document', time: '1 day ago', icon: TrendingUp },
        { id: 4, student: 'Priya Patel', action: 'Pending follow-up scheduled', time: '2 days ago', icon: Clock }
    ];

    return (
        <div style={{ width: '100%', minHeight: '100%' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem', padding: '2rem 2rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <GraduationCap size={32} style={{ color: 'var(--primary-600)' }} />
                            Counselling Dashboard
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                            Today is {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={() => navigate('/dashboard/courses/create')}
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <BookOpen size={18} />
                            Create Course
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/sessions/schedule')}
                            className="btn btn-ghost"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Calendar size={18} />
                            Schedule Session
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/students')}
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Users size={18} />
                            View All Students
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem', padding: '0 2rem' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '1.75rem',
                        borderRadius: '1rem',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)',
                        transition: 'transform 0.2s',
                        cursor: 'pointer'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Students</p>
                                <p style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>45</p>
                                <p style={{ fontSize: '0.75rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <TrendingUp size={14} />
                                    +15% from last month
                                </p>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.875rem', borderRadius: '0.875rem' }}>
                                <Users size={32} />
                            </div>
                        </div>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        padding: '1.75rem',
                        borderRadius: '1rem',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(240, 147, 251, 0.25)',
                        transition: 'transform 0.2s',
                        cursor: 'pointer'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Active Sessions</p>
                                <p style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>12</p>
                                <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>+8 sessions this week</p>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.875rem', borderRadius: '0.875rem' }}>
                                <Calendar size={32} />
                            </div>
                        </div>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        padding: '1.75rem',
                        borderRadius: '1rem',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(79, 172, 254, 0.25)',
                        transition: 'transform 0.2s',
                        cursor: 'pointer'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Avg Performance</p>
                                <p style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>82%</p>
                                <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Across all assessments</p>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.875rem', borderRadius: '0.875rem' }}>
                                <BarChart3 size={32} />
                            </div>
                        </div>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                        padding: '1.75rem',
                        borderRadius: '1rem',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(250, 112, 154, 0.25)',
                        transition: 'transform 0.2s',
                        cursor: 'pointer'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Pending Actions</p>
                                <p style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>8</p>
                                <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Assessments & follow-ups</p>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.875rem', borderRadius: '0.875rem' }}>
                                <Clock size={32} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', padding: '0 2rem' }}>
                {/* Upcoming Sessions */}
                <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid var(--gray-200)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={20} />
                            Today's Sessions
                        </h2>
                        <button
                            onClick={() => navigate('/dashboard/sessions')}
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: '0.75rem' }}
                        >
                            View All <ArrowRight size={14} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {todaysSessions.map(session => (
                            <div
                                key={session.id}
                                style={{
                                    padding: '1rem',
                                    background: 'var(--gray-50)',
                                    borderRadius: '0.75rem',
                                    border: '1px solid var(--gray-200)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--gray-100)';
                                    e.currentTarget.style.borderColor = 'var(--primary-300)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'var(--gray-50)';
                                    e.currentTarget.style.borderColor = 'var(--gray-200)';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
                                            {session.studentName}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Calendar size={12} />
                                            {session.type}
                                        </p>
                                    </div>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        background: session.status === 'Confirmed' ? 'var(--success-50)' : 'var(--blue-50)',
                                        color: session.status === 'Confirmed' ? 'var(--success-700)' : 'var(--blue-700)',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                    }}>
                                        {session.status}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Clock size={12} />
                                        {session.time}
                                    </span>
                                    <span>• {session.duration}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Performers */}
                <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid var(--gray-200)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrendingUp size={20} />
                            Top Performers
                        </h2>
                        <button
                            onClick={() => navigate('/dashboard/students')}
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: '0.75rem' }}
                        >
                            View All <ArrowRight size={14} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {topPerformers.map((student, idx) => (
                            <div
                                key={student.id}
                                style={{
                                    padding: '1rem',
                                    background: 'var(--gray-50)',
                                    borderRadius: '0.75rem',
                                    border: '1px solid var(--gray-200)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--gray-100)';
                                    e.currentTarget.style.borderColor = 'var(--success-300)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'var(--gray-50)';
                                    e.currentTarget.style.borderColor = 'var(--gray-200)';
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: idx === 0 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : idx === 1 ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 700,
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        {student.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-900)' }}>{student.name}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>{student.grade} • {student.sessions} sessions</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-600)' }}>{student.score}%</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>Excellent</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid var(--gray-200)', margin: '0 2rem 2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={20} />
                    Recent Activity
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {recentActivity.map(activity => {
                        const IconComponent = activity.icon;
                        return (
                            <div
                                key={activity.id}
                                style={{
                                    padding: '1rem',
                                    background: 'var(--gray-50)',
                                    borderRadius: '0.75rem',
                                    border: '1px solid var(--gray-200)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-100)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'var(--primary-50)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <IconComponent size={18} style={{ color: 'var(--primary-600)' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
                                        {activity.student}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>{activity.action}</p>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>
                                    {activity.time}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
