import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft, Save, Video, FileText } from 'lucide-react';
import { MOCK_STUDENTS } from '../data/mockStudentData';

export default function ScheduleSession() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        studentId: '',
        date: '',
        time: '',
        duration: '45 min',
        type: 'Career Guidance',
        notes: '',
        sendInvite: true
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Scheduling session:', formData);
        // In a real app, this would be an API call
        alert('Session scheduled successfully! (Mock)');
        navigate('/dashboard/sessions');
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
                    </label>
                    <select
                        className="input"
                        required
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    >
                        <option value="">-- Choose a student --</option>
                        {MOCK_STUDENTS.map(student => (
                            <option key={student.id} value={student.id}>
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
                        <label className="label">Duration</label>
                        <select
                            className="input"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        >
                            <option value="15 min">15 min</option>
                            <option value="30 min">30 min</option>
                            <option value="45 min">45 min</option>
                            <option value="60 min">1 hour</option>
                            <option value="90 min">1.5 hours</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Session Type</label>
                        <select
                            className="input"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="Career Guidance">Career Guidance</option>
                            <option value="Academic Planning">Academic Planning</option>
                            <option value="Personal Counselling">Personal Counselling</option>
                            <option value="Parent Meeting">Parent Meeting</option>
                            <option value="Follow-up">Follow-up</option>
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

                {/* Video Link Option */}
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={formData.sendInvite}
                            onChange={(e) => setFormData({ ...formData, sendInvite: e.target.checked })}
                            style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary-600)' }}
                        />
                        <span style={{ fontSize: '0.95rem', color: 'var(--gray-700)', fontWeight: 500 }}>
                            Send calendar invite with Google Meet link
                        </span>
                        <Video size={16} className="text-gray-400" />
                    </label>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginLeft: '2rem', marginTop: '0.25rem' }}>
                        An email invitation will be sent to the student automatically.
                    </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--gray-200)' }}>
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => navigate('/dashboard/sessions')}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Save size={18} />
                        Schedule Session
                    </button>
                </div>

            </form>
        </div>
    );
}
