import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Video, CheckCircle, FileText, AlertCircle, Edit, Save, Loader } from 'lucide-react';
import api from '../services/api';
import { showToast } from '../utils/toast';

interface Session {
    _id: string;
    studentId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        currentGrade: string;
    };
    counsellorId: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    sessionType: string;
    sessionMode: string;
    scheduledAt: string;
    duration: number;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    sessionSummary?: string;
    actionItems?: string[];
    meetingLink?: string;
}

export default function SessionDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [summary, setSummary] = useState('');
    const [actionItems, setActionItems] = useState<string[]>([]);
    const [newActionItem, setNewActionItem] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSession = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await api.sessions.getById(id);
                setSession(data);
                setSummary(data.sessionSummary || '');
                setActionItems(data.actionItems || []);
                // If it's completed, we shouldn't default to edit mode
                if (data.status !== 'completed' && !data.sessionSummary) {
                    setIsEditing(true);
                }
            } catch (error) {
                console.error('Failed to fetch session:', error);
                showToast.error('Could not load session details');
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, [id]);

    const handleSaveSession = async () => {
        if (!id || !session) return;
        setSaving(true);
        try {
            const payload = {
                sessionSummary: summary,
                actionItems: actionItems
            };
            const updated = await api.sessions.update(id, payload);
            setSession(updated);
            setIsEditing(false);
            showToast.success('Session notes saved successfully');
        } catch (error: any) {
            console.error('Error saving session:', error);
            showToast.error(error.message || 'Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const handleMarkCompleted = async () => {
        if (!id || !session) return;
        try {
            const updated = await api.sessions.update(id, { status: 'completed' });
            setSession(updated);
            showToast.success('Session marked as completed');
        } catch (error) {
            showToast.error('Failed to update status');
        }
    };

    const handleAddActionItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (newActionItem.trim()) {
            setActionItems([...actionItems, newActionItem.trim()]);
            setNewActionItem('');
        }
    };

    const handleRemoveActionItem = (index: number) => {
        setActionItems(actionItems.filter((_, i) => i !== index));
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
                <Loader className="animate-spin text-primary-600" size={48} />
                <p className="text-gray-500">Loading session details...</p>
            </div>
        );
    }

    if (!session) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--gray-900)' }}>Session not found</h2>
                <button
                    onClick={() => navigate('/dashboard/sessions')}
                    className="btn btn-primary"
                    style={{ marginTop: '1rem' }}
                >
                    Back to Sessions
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', width: '100%' }}>
            {/* Header & Status */}
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <button
                        onClick={() => navigate('/dashboard/sessions')}
                        className="btn btn-ghost"
                        style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: 0 }}
                    >
                        <ArrowLeft size={18} />
                        Back to Sessions
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--gray-900)', textTransform: 'capitalize' }}>
                            {session.sessionType} Session
                        </h1>
                        <span style={{
                            padding: '0.375rem 1rem',
                            background: session.status === 'completed' ? 'var(--success-50)' : 'var(--blue-50)',
                            color: session.status === 'completed' ? 'var(--success-700)' : 'var(--blue-700)',
                            borderRadius: '2rem',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            border: '1px solid currentColor',
                            textTransform: 'capitalize'
                        }}>
                            {session.status.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                {session.status !== 'completed' && session.status !== 'cancelled' && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {session.meetingLink && (
                            <a
                                href={session.meetingLink}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-outline"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--blue-500)', color: 'var(--blue-600)' }}
                            >
                                <Video size={18} />
                                Join Video Call
                            </a>
                        )}
                        <button
                            className="btn btn-primary"
                            style={{ background: 'var(--success-600)', border: 'none' }}
                            onClick={handleMarkCompleted}
                        >
                            Mark as Completed
                        </button>
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem', maxWidth: '1400px' }}>

                {/* Sidebar: Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Student Card */}
                    <div className="card">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                            Student
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                background: 'var(--primary-100)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary-700)',
                                fontWeight: 700,
                                fontSize: '1.25rem'
                            }}>
                                {session.studentId.firstName[0]}{session.studentId.lastName[0]}
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                                    {session.studentId.firstName} {session.studentId.lastName}
                                </h4>
                                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>{session.studentId.currentGrade} Grade</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(`/dashboard/students/${session.studentId._id}`)}
                            className="btn btn-outline btn-sm w-full"
                        >
                            View Student Profile
                        </button>
                    </div>

                    {/* Session Info */}
                    <div className="card">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                            Schedule Info
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--gray-700)' }}>
                                <Calendar size={18} className="text-gray-400" />
                                <span style={{ fontWeight: 500 }}>
                                    {new Date(session.scheduledAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--gray-700)' }}>
                                <Clock size={18} className="text-gray-400" />
                                <span>
                                    {new Date(session.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} ({session.duration} min)
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--gray-700)', textTransform: 'capitalize' }}>
                                <Video size={18} className="text-gray-400" />
                                <span>{session.sessionMode} Mode</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content: Notes & Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Session Summary */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FileText size={20} className="text-primary-600" />
                                Session Summary & Notes
                            </h2>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="btn btn-ghost btn-sm"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <Edit size={16} /> Edit
                                </button>
                            ) : (
                                <button
                                    onClick={handleSaveSession}
                                    disabled={saving}
                                    className="btn btn-primary btn-sm"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    {saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
                                    Save Changes
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <textarea
                                className="input w-full"
                                rows={10}
                                placeholder="Write a summary of the session, key discussion points, and observations..."
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                style={{ fontSize: '1rem', lineHeight: '1.6', padding: '1rem' }}
                            />
                        ) : (
                            <div style={{ lineHeight: '1.6', color: 'var(--gray-700)', whiteSpace: 'pre-wrap', padding: '1rem', background: 'var(--gray-50)', borderRadius: '0.5rem' }}>
                                {summary || <span style={{ color: 'var(--gray-400)', fontStyle: 'italic' }}>No notes added yet. Click edit to add a summary of the counselling session.</span>}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Action Items - Full Width Below Grid */}
            <div className="card" style={{ maxWidth: '1400px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <CheckCircle size={20} className="text-success-600" />
                    Action Items / Next Steps
                </h2>

                {/* List */}
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {actionItems.map((item, index) => (
                        <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--gray-50)', borderRadius: '0.5rem', border: '1px solid var(--gray-200)' }}>
                            <div style={{ color: 'var(--success-600)' }}>
                                <CheckCircle size={16} />
                            </div>
                            <span style={{ flex: 1, fontSize: '0.95rem', color: 'var(--gray-800)' }}>{item}</span>
                            {isEditing && (
                                <button
                                    onClick={() => handleRemoveActionItem(index)}
                                    style={{ color: 'var(--error-500)', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    <AlertCircle size={16} />
                                </button>
                            )}
                        </li>
                    ))}
                    {actionItems.length === 0 && !isEditing && (
                        <p style={{ color: 'var(--gray-500)', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>No action items listed for this session.</p>
                    )}
                </ul>

                {/* Add New Item */}
                {isEditing && (
                    <form onSubmit={handleAddActionItem} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            className="input flex-1"
                            placeholder="Add a new action item..."
                            value={newActionItem}
                            onChange={(e) => setNewActionItem(e.target.value)}
                        />
                        <button type="submit" className="btn btn-outline" disabled={!newActionItem.trim()}>
                            Add
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
