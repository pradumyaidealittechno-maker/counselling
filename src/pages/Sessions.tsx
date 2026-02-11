import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Video, CheckCircle, AlertCircle, Plus, MoreVertical, FileText, Loader } from 'lucide-react';
import api from '../services/api';

interface Session {
    _id: string;
    studentId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        currentGrade: string;
    };
    sessionType: 'academic' | 'career' | 'personal' | 'assessment' | 'follow-up';
    sessionMode: 'voice' | 'video' | 'chat' | 'in-person';
    scheduledAt: string;
    duration: number;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
    sessionCode?: string;
    sessionSummary?: string;
}

export default function Sessions() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            setLoading(true);
            try {
                const data = await api.sessions.getAll();
                setSessions(data);
            } catch (error) {
                console.error('Failed to fetch sessions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    const upcomingSessions = sessions.filter(s => new Date(s.scheduledAt) >= new Date(new Date().setHours(0, 0, 0, 0))).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    const pastSessions = sessions.filter(s => new Date(s.scheduledAt) < new Date(new Date().setHours(0, 0, 0, 0))).sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

    const currentSessions = activeTab === 'upcoming' ? upcomingSessions : pastSessions;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'scheduled': return { bg: 'var(--blue-50)', text: 'var(--blue-700)', icon: Calendar, label: 'Scheduled' };
            case 'in_progress': return { bg: 'var(--warning-50)', text: 'var(--warning-700)', icon: Clock, label: 'In Progress' };
            case 'completed': return { bg: 'var(--success-50)', text: 'var(--success-700)', icon: CheckCircle, label: 'Completed' };
            case 'cancelled': return { bg: 'var(--error-50)', text: 'var(--error-700)', icon: AlertCircle, label: 'Cancelled' };
            case 'no_show': return { bg: 'var(--gray-50)', text: 'var(--gray-700)', icon: AlertCircle, label: 'No Show' };
            default: return { bg: 'var(--gray-100)', text: 'var(--gray-700)', icon: Clock, label: status };
        }
    };

    return (
        <div style={{ padding: '2rem', width: '100%', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Calendar size={32} style={{ color: 'var(--primary-600)' }} />
                        Sessions
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        Manage upcoming counseling sessions and review summaries
                    </p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/sessions/schedule')}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Plus size={18} />
                    Schedule Session
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)', marginBottom: '2rem' }}>
                <button
                    onClick={() => setActiveTab('upcoming')}
                    style={{
                        padding: '1rem 2rem',
                        borderBottom: activeTab === 'upcoming' ? '2px solid var(--primary-600)' : 'none',
                        color: activeTab === 'upcoming' ? 'var(--primary-600)' : 'var(--gray-500)',
                        fontWeight: 600,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 0.2s'
                    }}
                >
                    Upcoming ({upcomingSessions.length})
                </button>
                <button
                    onClick={() => setActiveTab('past')}
                    style={{
                        padding: '1rem 2rem',
                        borderBottom: activeTab === 'past' ? '2px solid var(--primary-600)' : 'none',
                        color: activeTab === 'past' ? 'var(--primary-600)' : 'var(--gray-500)',
                        fontWeight: 600,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 0.2s'
                    }}
                >
                    Past ({pastSessions.length})
                </button>
            </div>

            {/* Sessions List */}
            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                        <Loader className="animate-spin text-primary-600" size={32} />
                    </div>
                ) : currentSessions.length > 0 ? (
                    currentSessions.map(session => {
                        const style = getStatusStyle(session.status);
                        const StatusIcon = style.icon;

                        return (
                            <div
                                key={session._id}
                                style={{
                                    background: 'white',
                                    borderRadius: '1rem',
                                    padding: '1.5rem',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    border: '1px solid var(--gray-200)',
                                    display: 'grid',
                                    gridTemplateColumns: 'minmax(200px, 2fr) minmax(150px, 1fr) minmax(150px, 1fr) auto',
                                    gap: '1.5rem',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                }}
                                onClick={() => navigate(`/dashboard/sessions/${session._id}`)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                }}
                            >
                                {/* Student Info & Type */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        background: 'var(--primary-50)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--primary-600)',
                                        fontWeight: 700,
                                        fontSize: '1.125rem'
                                    }}>
                                        {session.studentId ? `${session.studentId.firstName[0]}${session.studentId.lastName[0]}` : '??'}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
                                            {session.studentId ? `${session.studentId.firstName} ${session.studentId.lastName}` : 'Unknown Student'}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--gray-600)',
                                                background: 'var(--gray-100)',
                                                padding: '0.125rem 0.5rem',
                                                borderRadius: '0.25rem',
                                                textTransform: 'capitalize'
                                            }}>
                                                {session.sessionType}
                                            </span>
                                            {session.sessionMode === 'video' && <Video size={14} className="text-blue-500" />}
                                        </div>
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-900)', fontWeight: 500 }}>
                                        <Calendar size={16} className="text-gray-400" />
                                        {formatDate(session.scheduledAt)}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                                        <Clock size={16} className="text-gray-400" />
                                        {formatTime(session.scheduledAt)} ({session.duration} min)
                                    </div>
                                </div>

                                {/* Status */}
                                <div>
                                    <span style={{
                                        padding: '0.375rem 0.75rem',
                                        background: style.bg,
                                        color: style.text,
                                        borderRadius: '2rem',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.375rem'
                                    }}>
                                        <StatusIcon size={14} />
                                        {style.label}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button className="btn btn-ghost btn-icon" onClick={(e) => e.stopPropagation()}>
                                        <MoreVertical size={20} className="text-gray-400" />
                                    </button>
                                    {activeTab === 'past' && session.sessionSummary && (
                                        <button className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FileText size={14} />
                                            View Summary
                                        </button>
                                    )}
                                    {activeTab === 'upcoming' && (
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/dashboard/sessions/${session._id}`);
                                            }}
                                        >
                                            View Details
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div style={{ padding: '4rem', textAlign: 'center', background: 'white', borderRadius: '1rem', border: '1px solid var(--gray-200)' }}>
                        <Calendar size={48} style={{ color: 'var(--gray-300)', margin: '0 auto 1rem' }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>No sessions found</h3>
                        <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>There are no {activeTab} sessions scheduled.</p>
                        {activeTab === 'upcoming' && (
                            <button
                                onClick={() => navigate('/dashboard/sessions/schedule')}
                                className="btn btn-primary"
                            >
                                Schedule New Session
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
