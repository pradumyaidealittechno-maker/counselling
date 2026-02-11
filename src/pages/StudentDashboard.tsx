import { Calendar, CheckCircle, BookOpen, Video, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
    const navigate = useNavigate();

    const nextSession = {
        title: 'Career Guidance Session',
        date: 'Tomorrow, 2:00 PM',
        counsellor: 'Dr. Sarah Wilson',
        link: 'https://meet.google.com/abc-defg-hij'
    };

    const tasks = [
        { id: 1, title: 'Complete Career Interest Survey', due: 'Today', status: 'Pending' },
        { id: 2, title: 'Upload Class 10th Transcripts', due: 'Tomorrow', status: 'Pending' },
        { id: 3, title: 'Review College List', due: 'Feb 15, 2026', status: 'Completed' }
    ];

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

            {/* Welcome Section */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                    Welcome back, Rahul! 👋
                </h1>
                <p style={{ color: 'var(--gray-600)' }}>Here's what's on your schedule for today.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 2fr) minmax(300px, 1fr)', gap: '2rem' }}>

                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Next Session Card */}
                    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '1rem', padding: '2rem', color: 'white', boxShadow: '0 4px 6px rgba(102, 126, 234, 0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Calendar size={16} /> Up Next
                                </p>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{nextSession.title}</h2>
                                <p style={{ fontSize: '1rem', opacity: 0.9 }}>{nextSession.date} • with {nextSession.counsellor}</p>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                                <Video size={32} />
                            </div>
                        </div>
                        <a
                            href={nextSession.link}
                            target="_blank"
                            rel="noreferrer"
                            className="btn"
                            style={{ background: 'white', color: '#667eea', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
                        >
                            Join Meeting <ArrowRight size={16} />
                        </a>
                    </div>

                    {/* Action Items */}
                    <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', border: '1px solid var(--gray-200)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <CheckCircle size={20} className="text-primary-600" />
                            Your Tasks
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {tasks.map(task => (
                                <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '0.75rem', background: task.status === 'Completed' ? 'var(--gray-50)' : 'white', border: '1px solid var(--gray-200)' }}>
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        border: task.status === 'Completed' ? 'none' : '2px solid var(--gray-300)',
                                        background: task.status === 'Completed' ? 'var(--success-500)' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white'
                                    }}>
                                        {task.status === 'Completed' && <CheckCircle size={16} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 500, color: task.status === 'Completed' ? 'var(--gray-500)' : 'var(--gray-900)', textDecoration: task.status === 'Completed' ? 'line-through' : 'none' }}>
                                            {task.title}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: task.due === 'Today' ? 'var(--error-600)' : 'var(--gray-500)' }}>
                                            Due: {task.due}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Quick Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--gray-200)', textAlign: 'center' }}>
                            <div style={{ width: '48px', height: '48px', margin: '0 auto 0.75rem', background: 'var(--blue-50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <BookOpen size={24} className="text-blue-600" />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>2</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Active Courses</p>
                        </div>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--gray-200)', textAlign: 'center' }}>
                            <div style={{ width: '48px', height: '48px', margin: '0 auto 0.75rem', background: 'var(--purple-50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Clock size={24} className="text-purple-600" />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>12</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Hours Spent</p>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--gray-200)' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button onClick={() => navigate('/dashboard/sessions')} className="btn btn-outline" style={{ justifyContent: 'start' }}>
                                📅 Schedule a Session
                            </button>
                            <button onClick={() => navigate('/dashboard/resources')} className="btn btn-outline" style={{ justifyContent: 'start' }}>
                                📚 Browse Resources
                            </button>
                            <button onClick={() => navigate('/dashboard/courses')} className="btn btn-outline" style={{ justifyContent: 'start' }}>
                                🎓 View My Courses
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
