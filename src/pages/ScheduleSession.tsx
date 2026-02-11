import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft, Save, FileText, Loader } from 'lucide-react';
import api from '../services/api';
import { showToast } from '../utils/toast';

interface Student {
    _id: string;
    firstName: string;
    lastName: string;
    currentGrade: string;
}

export default function ScheduleSession() {
    const navigate = useNavigate();
    const [students, setStudents] = useState<Student[]>([]);
    const [fetchingStudents, setFetchingStudents] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        studentId: '',
        date: '',
        time: '',
        duration: '45',
        sessionType: 'career',
        sessionMode: 'video',
        notes: '',
        sendInvite: true
    });

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const data = await api.students.getAll();
                setStudents(data);
            } catch (error) {
                console.error('Failed to fetch students:', error);
                showToast.error('Could not load students list');
            } finally {
                setFetchingStudents(false);
            }
        };
        fetchStudents();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Combine date and time into a single ISO string
            const scheduledAt = new Date(`${formData.date}T${formData.time}:00`).toISOString();

            const payload = {
                studentId: formData.studentId,
                scheduledAt,
                duration: parseInt(formData.duration),
                sessionType: formData.sessionType,
                sessionMode: formData.sessionMode,
                preSessionNotes: formData.notes
            };

            await api.sessions.create(payload);
            showToast.success('Session scheduled successfully!');
            navigate('/dashboard/sessions');
        } catch (error: any) {
            console.error('Error scheduling session:', error);
            showToast.error(error.message || 'Failed to schedule session');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/dashboard/sessions')}
                    className="btn btn-ghost"
                    style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: 0 }}
                >
                    <ArrowLeft size={18} />
                    Back to Sessions
                </button>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                    Schedule New Session
                </h1>
                <p style={{ color: 'var(--gray-600)' }}>
                    Create a new counselling appointment for a student.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid var(--gray-200)' }}>

                {/* Student Selection */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={16} />
                        Select Student
                        {fetchingStudents && <Loader className="animate-spin" size={12} />}
                    </label>
                    <select
                        className="input"
                        required
                        disabled={fetchingStudents}
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    >
                        <option value="">-- Choose a student --</option>
                        {students.map(student => (
                            <option key={student._id} value={student._id}>
                                {student.firstName} {student.lastName} ({student.currentGrade})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Date & Time */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={16} />
                            Date
                        </label>
                        <input
                            type="date"
                            className="input"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={16} />
                            Time
                        </label>
                        <input
                            type="time"
                            className="input"
                            required
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        />
                    </div>
                </div>

                {/* Duration & Type */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label className="label">Duration (minutes)</label>
                        <select
                            className="input"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        >
                            <option value="15">15 min</option>
                            <option value="30">30 min</option>
                            <option value="45">45 min</option>
                            <option value="60">1 hour</option>
                            <option value="90">1.5 hours</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Session Type</label>
                        <select
                            className="input"
                            value={formData.sessionType}
                            onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
                        >
                            <option value="career">Career Guidance</option>
                            <option value="academic">Academic Planning</option>
                            <option value="personal">Personal Counselling</option>
                            <option value="assessment">Assessment Review</option>
                            <option value="follow-up">Follow-up</option>
                        </select>
                    </div>
                </div>

                {/* Mode & Invite */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label className="label">Session Mode</label>
                        <select
                            className="input"
                            value={formData.sessionMode}
                            onChange={(e) => setFormData({ ...formData, sessionMode: e.target.value as any })}
                        >
                            <option value="video">Video Call</option>
                            <option value="voice">Voice Call</option>
                            <option value="chat">Chat Session</option>
                            <option value="in-person">In Person</option>
                        </select>
                    </div>
                </div>

                {/* Notes */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={16} />
                        Pre-session Notes (Optional)
                    </label>
                    <textarea
                        className="input"
                        rows={4}
                        placeholder="Add any specific topics to discuss or notes for preparation..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--gray-200)' }}>
                    <button
                        type="button"
                        className="btn btn-ghost"
                        disabled={submitting}
                        onClick={() => navigate('/dashboard/sessions')}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting || fetchingStudents}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {submitting ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                        Schedule Session
                    </button>
                </div>

            </form>
        </div>
    );
}
