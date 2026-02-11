import { useState, useEffect } from 'react';
import { Calendar, Users, BarChart3, Clock, ArrowRight, TrendingUp, BookOpen, GraduationCap, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function CounsellingDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dashboardStats, setDashboardStats] = useState<any>(null);
    const [todaysSessions, setTodaysSessions] = useState<any[]>([]);
    const [recentStudents, setRecentStudents] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch dashboard statistics
            const stats = await api.counsellingDashboard.getStats();
            setDashboardStats(stats);

            // Fetch today's sessions
            const sessionsData = await api.sessions.getAll();
            const today = new Date().toDateString();
            const todaySessions = sessionsData.filter((s: any) =>
                new Date(s.scheduledAt).toDateString() === today
            ).slice(0, 3);
            setTodaysSessions(todaySessions);

            // Fetch recent students
            const studentsData = await api.students.getAll();
            setRecentStudents(studentsData.slice(0, 5));
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const recentActivity = [
        { id: 1, student: 'Recent activity', action: 'Loading...', time: 'Just now', icon: Calendar },
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
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                        <Loader size={48} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary-600)' }} />
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
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
                                    <p style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                        {dashboardStats?.stats?.totalStudents || 0}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <TrendingUp size={14} />
                                        Active in system
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
                                    <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Sessions</p>
                                    <p style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                        {dashboardStats?.stats?.totalSessions || 0}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>All time</p>
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
                                    <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Upcoming</p>
                                    <p style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                        {dashboardStats?.stats?.upcomingSessions || 0}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Next 7 days</p>
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
                                    <p style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                        {dashboardStats?.stats?.pendingActions || 0}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Assessments & follow-ups</p>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.875rem', borderRadius: '0.875rem' }}>
                                    <Clock size={32} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
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
                        {todaysSessions.length > 0 ? (
                            todaysSessions.map((session: any) => (
                                <div
                                    key={session._id}
                                    style={{
                                        padding: '1rem',
                                        background: 'var(--gray-50)',
                                        borderRadius: '0.75rem',
                                        border: '1px solid var(--gray-200)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
                                            {session.studentId?.firstName} {session.studentId?.lastName}
                                        </span>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            background: session.status === 'scheduled' ? 'var(--blue-50)' : 'var(--success-50)',
                                            color: session.status === 'scheduled' ? 'var(--blue-700)' : 'var(--success-700)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            textTransform: 'capitalize'
                                        }}>
                                            {session.status}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                        <span>{session.type || 'General Counselling'}</span>
                                        <span>•</span>
                                        <span>{new Date(session.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span>•</span>
                                        <span>{session.duration || '45'} min</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '2rem 0' }}>
                                No sessions scheduled for today
                            </p>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid var(--gray-200)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={20} />
                            Recent Activity
                        </h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {recentActivity.map((activity) => (
                            <div key={activity.id} style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ padding: '0.75rem', background: 'var(--gray-100)', borderRadius: '0.5rem', height: 'fit-content' }}>
                                    <activity.icon size={18} style={{ color: 'var(--gray-600)' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
                                        {activity.student}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                                        {activity.action}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Students */}
            <div style={{ padding: '0 2rem 2rem' }}>
                <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid var(--gray-200)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrendingUp size={20} />
                            Recent Students
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
                        {recentStudents.map((student: any, idx: number) => (
                            <div
                                key={student._id}
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
                                onClick={() => navigate(`/dashboard/students/${student._id}`)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'white';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'var(--gray-50)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 700,
                                        fontSize: '1rem'
                                    }}>
                                        {`${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
                                            {student.firstName} {student.lastName}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                                            {student.currentGrade} • {student.currentSchool}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        background: idx === 0 ? 'var(--success-50)' : idx === 1 ? 'var(--warning-50)' : 'var(--blue-50)',
                                        color: idx === 0 ? 'var(--success-700)' : idx === 1 ? 'var(--warning-700)' : 'var(--blue-700)',
                                        padding: '0.375rem 0.75rem',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: 600
                                    }}>
                                        #{idx + 1}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
