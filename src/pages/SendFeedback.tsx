import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, User, Send, CheckCircle, Loader, ThumbsUp, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { showToast } from '../utils/toast';

export default function SendFeedback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const candidateIdFromUrl = searchParams.get('candidateId');

    const [candidates, setCandidates] = useState<any[]>([]);
    const [selectedCandidateId, setSelectedCandidateId] = useState(candidateIdFromUrl || '');
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [feedbackType, setFeedbackType] = useState('selected'); // 'selected' or 'rejected'

    // Editable fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    useEffect(() => {
        loadCandidates();
    }, []);

    useEffect(() => {
        if (selectedCandidateId) {
            const candidate = candidates.find(c => c._id === selectedCandidateId);
            setSelectedCandidate(candidate);
            if (candidate) {
                setFirstName(candidate.firstName);
                setLastName(candidate.lastName);
                setEmail(candidate.email);

                setSubject(`Interview Feedback – Selected (Positive Result)`);
            }
        }
    }, [selectedCandidateId, candidates]);

    // Update message when feedback type changes
    useEffect(() => {
        if (selectedCandidate) {
            const jobTitle = selectedCandidate.jobId?.title || 'Position';

            if (feedbackType === 'selected') {
                setMessage(`Interview Feedback – Selected

Dear ${firstName || 'Candidate'},

Thank you for participating in the AI-powered interview for the position of ${jobTitle}.

We are pleased to inform you that you have successfully cleared the interview round. Your technical skills, problem-solving approach, and overall performance met our expectations.

Our team was particularly impressed with:
  • Your understanding of full-stack concepts
  • Your approach to real-world problem solving
  • Your communication and clarity

The next steps regarding onboarding and further discussions will be shared with you shortly.

If you have any questions in the meantime, feel free to reach out.

Congratulations, and we look forward to working with you!

Best regards,
HR Team
`);
            } else {
                setMessage(`Interview Feedback – Thank You

Dear ${firstName || 'Candidate'},

Thank you for taking the time to participate in the AI-powered interview for the position of ${jobTitle}.

We appreciate your interest in joining our team and the effort you put into the interview process.

After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.

We encourage you to apply for future openings that align with your skills and experience. We will keep your resume on file for consideration.

We wish you all the best in your job search and future endeavors.

Best regards,
HR Team
`);
            }
        }
    }, [selectedCandidate, feedbackType, firstName]);

    const loadCandidates = async () => {
        try {
            const data = await api.candidates.getAll();
            // Filter only candidates with interview complete or ai_analysis_ready status
            const filteredCandidates = (data || []).filter((c: any) =>
                c.status === 'interview_complete' || c.status === 'ai_analysis_ready'
            );
            setCandidates(filteredCandidates);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load candidates:', error);
            setLoading(false);
        }
    };

    const handleSendFeedback = async () => {
        if (!selectedCandidate) {
            showToast.error('Please select a candidate');
            return;
        }

        setSending(true);

        try {
            // Call backend API to send feedback via N8N webhook
            const response = await fetch(`${API_URL}/api/candidates/${selectedCandidateId}/send-feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    subject,
                    message,
                    feedbackType
                })
            });

            if (response.ok) {
                console.log('✅ Feedback sent successfully via N8N webhook');
                setSent(true);
                setTimeout(() => navigate('/dashboard/candidates'), 2000);
            } else {
                const error = await response.json();
                showToast.error(`Failed to send feedback: ${error.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Failed to send feedback:', error);
            showToast.error('Failed to send feedback. Please try again.');
        } finally {
            setSending(false);
        }
    };


    if (sent) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem'
                    }}>
                        <CheckCircle size={32} color="white" />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--gray-800)' }}>
                        Feedback Sent!
                    </h2>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                        The candidate will receive an email with the feedback.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <Loader size={40} color="#E91E63" style={{ animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1rem' }}>
            {/* Main Form */}
            <div>
                {/* Back Button */}
                <button
                    onClick={() => navigate('/dashboard/candidates')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem',
                        marginBottom: '1rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--gray-600)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gray-900)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--gray-600)'}
                >
                    <ArrowLeft size={16} />
                    <span>Back to Candidates</span>
                </button>

                <div style={{ marginBottom: '1rem' }}>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--gray-800)' }}>
                        Send Interview Feedback
                    </h1>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                        Send feedback to candidates who have completed their interview
                    </p>
                </div>

                <div className="card" style={{ padding: '1.25rem' }}>
                    {/* Feedback Type Selection */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label" style={{ fontSize: '0.75rem' }}>Feedback Type</label>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => {
                                    setFeedbackType('selected');
                                    setSubject('Interview Feedback – Selected (Positive Result)');
                                }}
                                className={`btn btn-sm ${feedbackType === 'selected' ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ flex: 1 }}
                            >
                                <ThumbsUp size={14} /> Selected (Positive)
                            </button>
                            <button
                                onClick={() => {
                                    setFeedbackType('rejected');
                                    setSubject('Interview Feedback – Thank You');
                                }}
                                className={`btn btn-sm ${feedbackType === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ flex: 1 }}
                            >
                                <Mail size={14} /> Not Selected
                            </button>
                        </div>
                    </div>

                    {/* Candidate Selection */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label" style={{ fontSize: '0.75rem' }}>Select Candidate</label>
                        <div style={{ position: 'relative' }}>
                            <User size={16} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                            <select
                                className="input"
                                style={{ paddingLeft: '36px', padding: '0.5rem 0.75rem 0.5rem 36px', fontSize: '0.875rem' }}
                                value={selectedCandidateId}
                                onChange={(e) => setSelectedCandidateId(e.target.value)}
                            >
                                <option value="">-- Choose a candidate --</option>
                                {candidates.map((candidate) => (
                                    <option key={candidate._id} value={candidate._id}>
                                        {candidate.firstName} {candidate.lastName} ({candidate.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {selectedCandidate && (
                        <>
                            {/* Candidate Details - Editable */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label className="label" style={{ fontSize: '0.75rem' }}>First Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={16} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input
                                            type="text"
                                            className="input"
                                            style={{ paddingLeft: '36px', padding: '0.5rem 0.75rem 0.5rem 36px', fontSize: '0.875rem' }}
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="label" style={{ fontSize: '0.75rem' }}>Last Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={16} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input
                                            type="text"
                                            className="input"
                                            style={{ paddingLeft: '36px', padding: '0.5rem 0.75rem 0.5rem 36px', fontSize: '0.875rem' }}
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label className="label" style={{ fontSize: '0.75rem' }}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="email"
                                        className="input"
                                        style={{ paddingLeft: '36px', padding: '0.5rem 0.75rem 0.5rem 36px', fontSize: '0.875rem' }}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Email Editor */}
                            <div>
                                <label className="label" style={{ fontSize: '0.75rem' }}>Email Content</label>
                                <div style={{
                                    background: 'var(--white)',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #e5e7eb',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <label style={{ fontSize: '0.625rem', color: 'var(--gray-500)', display: 'block', marginBottom: '0.125rem' }}>Subject:</label>
                                            <input
                                                type="text"
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                style={{ width: '100%', padding: '0.375rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem' }}
                                            />
                                        </div>
                                    </div>

                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        style={{
                                            width: '100%',
                                            minHeight: '350px',
                                            padding: '0.75rem',
                                            border: 'none',
                                            resize: 'vertical',
                                            fontFamily: 'monospace',
                                            fontSize: '0.8125rem',
                                            lineHeight: '1.5',
                                            outline: 'none'
                                        }}
                                        placeholder="Enter feedback email content here..."
                                    />
                                    <div style={{ padding: '0.5rem 0.75rem', background: '#f3f4f6', borderTop: '1px solid #e5e7eb', fontSize: '0.625rem', color: 'var(--gray-500)' }}>
                                        Customize the feedback message as needed before sending.
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={handleSendFeedback}
                                    disabled={sending}
                                >
                                    {sending ? (
                                        <>
                                            <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={14} />
                                            Send Feedback
                                        </>
                                    )}
                                </button>
                                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/candidates')}>
                                    Cancel
                                </button>
                            </div>
                        </>
                    )}

                    {!selectedCandidate && (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem 1rem',
                            color: 'var(--gray-500)',
                            background: '#f9fafb',
                            borderRadius: '0.5rem'
                        }}>
                            <User size={48} color="#D1D5DB" style={{ margin: '0 auto 1rem' }} />
                            <p style={{ fontSize: '0.875rem' }}>Select a candidate to begin</p>
                            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Only candidates who have completed interviews are shown</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Feedback Info */}
                <div className="card" style={{
                    padding: '1rem',
                    background: feedbackType === 'selected'
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%)',
                    border: `1px solid ${feedbackType === 'selected' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <ThumbsUp size={18} color={feedbackType === 'selected' ? '#10B981' : '#EF4444'} />
                        <h3 style={{ fontWeight: 600, fontSize: '1rem' }}>Feedback Details</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {feedbackType === 'selected' ? (
                            <>
                                <div style={{
                                    padding: '0.5rem',
                                    background: 'var(--white)',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-500)' }}>
                                        <CheckCircle size={16} color="#10B981" />
                                        <span>Type: <strong style={{ color: '#10B981' }}>Selected</strong></span>
                                    </div>
                                </div>
                                <div style={{
                                    padding: '0.5rem',
                                    background: 'var(--white)',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem'
                                }}>
                                    <span style={{ color: 'var(--gray-500)' }}>Includes: Congratulations message</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{
                                    padding: '0.5rem',
                                    background: 'var(--white)',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-500)' }}>
                                        <Mail size={16} color="#EF4444" />
                                        <span>Type: <strong style={{ color: '#EF4444' }}>Not Selected</strong></span>
                                    </div>
                                </div>
                                <div style={{
                                    padding: '0.5rem',
                                    background: 'var(--white)',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem'
                                }}>
                                    <span style={{ color: 'var(--gray-500)' }}>Includes: Polite rejection</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Best Practices */}
                <div className="card" style={{ padding: '1rem' }}>
                    <h3 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.75rem' }}>Best Practices</h3>
                    <ul style={{ fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.8, paddingLeft: '1rem' }}>
                        <li>Be prompt with feedback</li>
                        <li>Keep tone professional</li>
                        <li>Personalize when possible</li>
                        <li>Provide constructive points</li>
                        <li>Thank them for their time</li>
                    </ul>
                </div>

                {/* Tips */}
                <div style={{
                    padding: '0.75rem',
                    background: '#f9fafb',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb'
                }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontWeight: 600, marginBottom: '0.5rem' }}>💡 Tip</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', lineHeight: 1.5 }}>
                        {feedbackType === 'selected'
                            ? 'Positive feedback helps build excitement for joining your team!'
                            : 'Respectful rejection emails maintain your company\'s positive reputation.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
