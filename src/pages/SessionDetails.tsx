import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_SESSIONS } from '../data/mockSessionData';
import { MOCK_STUDENTS } from '../data/mockStudentData';
import { ArrowLeft, Calendar, Clock, Video, CheckCircle, FileText, AlertCircle, Edit, Save } from 'lucide-react';

export default function SessionDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const session = MOCK_SESSIONS.find(s => s.id === id);

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

    const student = MOCK_STUDENTS.find(s => s.id === session.studentId);
    const [summary, setSummary] = useState(session.summary || '');
    const [isEditing, setIsEditing] = useState(!session.summary); // Edit mode if no summary
    const [actionItems, setActionItems] = useState<string[]>(session.actionItems || []);
    const [newActionItem, setNewActionItem] = useState('');

    const handleSaveSummary = () => {
        // Mock save logic
        console.log('Saving summary:', summary);
        console.log('Saving action items:', actionItems);
        setIsEditing(false);
        alert('Session summary saved! (Mock)');
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

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
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
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                            {session.type}
                        </h1>
                        <span style={{
                            padding: '0.25rem 0.75rem',
                            background: session.status === 'Completed' ? 'var(--success-50)' : 'var(--blue-50)',
                            color: session.status === 'Completed' ? 'var(--success-700)' : 'var(--blue-700)',
                            borderRadius: '2rem',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            border: session.status === 'Completed' ? '1px solid var(--success-200)' : '1px solid var(--blue-200)'
                        }}>
                            {session.status}
                        </span>
                    </div>
                </div>

                {session.status === 'Scheduled' && (
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
                                Join Google Meet
                            </a>
                        )}
                        <button
                            className="btn btn-primary"
                            style={{ background: 'var(--success-600)', border: 'none' }}
                            onClick={() => {
                                // Mark as completed logic
                                alert('Marked as completed! (Mock)');
                            }}
                        >
                            Mark as Completed
                        </button>
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(400px, 2fr)', gap: '2rem' }}>

                {/* Sidebar: Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Student Card */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--gray-200)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Student
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '1.25rem'
                            }}>
                                {session.studentName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)' }}>{session.studentName}</h4>
                                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>{student?.currentGrade} Grade</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(`/dashboard/students/${session.studentId}`)}
                            className="btn btn-outline btn-sm"
                            style={{ width: '100%' }}
                        >
                            View Full Profile
                        </button>
                    </div>

                    {/* Session Info */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--gray-200)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Session Details
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--gray-700)' }}>
                                <Calendar size={18} className="text-gray-400" />
                                <span style={{ fontWeight: 500 }}>{new Date(session.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--gray-700)' }}>
                                <Clock size={18} className="text-gray-400" />
                                <span>{session.time} ({session.duration})</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', color: 'var(--gray-700)' }}>
                                <Video size={18} className="text-gray-400" style={{ marginTop: '0.2rem' }} />
                                <span style={{ wordBreak: 'break-all', fontSize: '0.875rem', color: 'var(--blue-600)' }}>{session.meetingLink || 'No meeting link'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content: Notes & Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Session Summary */}
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--gray-200)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
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
                                    onClick={handleSaveSummary}
                                    className="btn btn-primary btn-sm"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <Save size={16} /> Save Changes
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <textarea
                                className="input"
                                rows={8}
                                placeholder="Write a summary of the session, key discussion points, and observations..."
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                style={{ fontSize: '1rem', lineHeight: '1.6' }}
                            />
                        ) : (
                            <div style={{ lineHeight: '1.6', color: 'var(--gray-700)', whiteSpace: 'pre-wrap' }}>
                                {summary || <span style={{ color: 'var(--gray-400)', fontStyle: 'italic' }}>No notes added yet. Click edit to add a summary.</span>}
                            </div>
                        )}
                    </div>

                    {/* Action Items */}
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--gray-200)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <CheckCircle size={20} className="text-success-600" />
                            Action Items / Next Steps
                        </h2>

                        {/* List */}
                        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {actionItems.map((item, index) => (
                                <li key={index} style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '0.5rem', border: '1px solid var(--gray-200)' }}>
                                    <div style={{ marginTop: '0.2rem', color: 'var(--success-600)' }}>
                                        <CheckCircle size={16} />
                                    </div>
                                    <span style={{ flex: 1, fontSize: '0.95rem', color: 'var(--gray-800)' }}>{item}</span>
                                    {isEditing && (
                                        <button
                                            onClick={() => handleRemoveActionItem(index)}
                                            className="text-error-500 hover:text-error-700"
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}
                                        >
                                            <AlertCircle size={16} />
                                        </button>
                                    )}
                                </li>
                            ))}
                            {actionItems.length === 0 && !isEditing && (
                                <p style={{ color: 'var(--gray-500)', fontStyle: 'italic' }}>No action items listed.</p>
                            )}
                        </ul>

                        {/* Add New Item */}
                        {isEditing && (
                            <form onSubmit={handleAddActionItem} style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Add a new action item..."
                                    value={newActionItem}
                                    onChange={(e) => setNewActionItem(e.target.value)}
                                />
                                <button type="submit" className="btn btn-outline" style={{ whiteSpace: 'nowrap' }}>
                                    Add Item
                                </button>
                            </form>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
