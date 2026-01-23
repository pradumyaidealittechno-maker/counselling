import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Briefcase,
    Calendar,
    Star,
    ThumbsUp,
    ThumbsDown,
    FileText,
    TrendingUp,
    Award,
    AlertCircle
} from 'lucide-react';
import api from '../services/api';

interface Candidate {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    experience?: string;
    status: string;
    jobId: {
        _id: string;
        title: string;
        department?: string;
    };
    interviewResult?: {
        overallScore?: number;
        recommendation?: string;
        strengths?: string[];
        weaknesses?: string[];
        technicalSkills?: any;
        communicationScore?: number;
        culturalFit?: number;
    };
    createdAt: string;
}

export default function CandidateFeedback() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCandidateDetails();
    }, [id]);

    const fetchCandidateDetails = async () => {
        try {
            setLoading(true);
            const data = await api.candidates.getById(id!);
            setCandidate(data);
        } catch (err: any) {
            console.error('Failed to fetch candidate:', err);
            setError('Failed to load candidate feedback');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        border: '4px solid #E5E7EB',
                        borderTopColor: '#E91E63',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                    <p style={{ color: 'var(--gray-500)' }}>Loading feedback...</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error || !candidate) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <AlertCircle size={48} color="#EF4444" style={{ margin: '0 auto 1rem' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                    {error || 'Candidate not found'}
                </h2>
                <Link to="/dashboard/candidates" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    Back to Candidates
                </Link>
            </div>
        );
    }

    const getScoreColor = (score?: number) => {
        if (!score) return '#6B7280';
        if (score >= 80) return '#059669';
        if (score >= 60) return '#F59E0B';
        return '#EF4444';
    };

    const getRecommendationIcon = (recommendation?: string) => {
        if (!recommendation) return null;
        const rec = recommendation.toLowerCase();
        if (rec.includes('strong') || rec.includes('recommend')) return <ThumbsUp size={20} color="#059669" />;
        if (rec.includes('not') || rec.includes('reject')) return <ThumbsDown size={20} color="#EF4444" />;
        return <FileText size={20} color="#F59E0B" />;
    };

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/dashboard/candidates')}
                    className="btn btn-ghost btn-sm"
                    style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <ArrowLeft size={16} />
                    Back to Candidates
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                            Interview Feedback
                        </h1>
                        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                            Detailed analysis and recommendations
                        </p>
                    </div>
                </div>
            </div>

            {/* Candidate Info Card */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.5rem',
                        fontWeight: 700
                    }}>
                        {candidate.firstName[0]}{candidate.lastName[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                            {candidate.firstName} {candidate.lastName}
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}>
                                <Mail size={16} />
                                <span style={{ fontSize: '0.875rem' }}>{candidate.email}</span>
                            </div>
                            {candidate.phone && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}>
                                    <Phone size={16} />
                                    <span style={{ fontSize: '0.875rem' }}>{candidate.phone}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}>
                                <Briefcase size={16} />
                                <span style={{ fontSize: '0.875rem' }}>{candidate.jobId.title}</span>
                            </div>
                            {candidate.experience && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}>
                                    <Calendar size={16} />
                                    <span style={{ fontSize: '0.875rem' }}>{candidate.experience} experience</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Check if interview result exists */}
            {!candidate.interviewResult || !candidate.interviewResult.overallScore ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <AlertCircle size={48} color="#F59E0B" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                        No Interview Feedback Available
                    </h3>
                    <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
                        This candidate hasn't completed their interview yet or the analysis is still being processed.
                    </p>
                    <Link
                        to={`/dashboard/candidates/${candidate._id}/report`}
                        className="btn btn-primary"
                    >
                        View Full Report
                    </Link>
                </div>
            ) : (
                <>
                    {/* Score Overview */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${getScoreColor(candidate.interviewResult.overallScore)} 0%, ${getScoreColor(candidate.interviewResult.overallScore)}CC 100%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1rem',
                                boxShadow: `0 4px 12px ${getScoreColor(candidate.interviewResult.overallScore)}40`
                            }}>
                                <Star size={32} color="white" />
                            </div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '0.5rem' }}>Overall Score</p>
                            <p style={{ fontSize: '2rem', fontWeight: 700, color: getScoreColor(candidate.interviewResult.overallScore) }}>
                                {candidate.interviewResult.overallScore}%
                            </p>
                        </div>

                        {candidate.interviewResult.communicationScore !== undefined && (
                            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #6366F1 0%, #6366F1CC 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1rem'
                                }}>
                                    <FileText size={32} color="white" />
                                </div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '0.5rem' }}>Communication</p>
                                <p style={{ fontSize: '2rem', fontWeight: 700, color: '#6366F1' }}>
                                    {candidate.interviewResult.communicationScore}%
                                </p>
                            </div>
                        )}

                        {candidate.interviewResult.culturalFit !== undefined && (
                            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #F59E0B 0%, #F59E0BCC 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1rem'
                                }}>
                                    <Award size={32} color="white" />
                                </div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '0.5rem' }}>Cultural Fit</p>
                                <p style={{ fontSize: '2rem', fontWeight: 700, color: '#F59E0B' }}>
                                    {candidate.interviewResult.culturalFit}%
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Recommendation */}
                    {candidate.interviewResult.recommendation && (
                        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                {getRecommendationIcon(candidate.interviewResult.recommendation)}
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)' }}>
                                    Recommendation
                                </h3>
                            </div>
                            <p style={{ fontSize: '1rem', color: 'var(--gray-700)', lineHeight: 1.6 }}>
                                {candidate.interviewResult.recommendation}
                            </p>
                        </div>
                    )}

                    {/* Strengths & Weaknesses */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        {/* Strengths */}
                        {candidate.interviewResult.strengths && candidate.interviewResult.strengths.length > 0 && (
                            <div className="card" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <TrendingUp size={20} color="#059669" />
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-900)' }}>
                                        Strengths
                                    </h3>
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {candidate.interviewResult.strengths.map((strength, index) => (
                                        <li key={index} style={{
                                            padding: '0.75rem',
                                            marginBottom: '0.5rem',
                                            background: '#ECFDF5',
                                            borderLeft: '3px solid #059669',
                                            borderRadius: '0.25rem',
                                            color: 'var(--gray-700)',
                                            fontSize: '0.875rem'
                                        }}>
                                            {strength}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Weaknesses */}
                        {candidate.interviewResult.weaknesses && candidate.interviewResult.weaknesses.length > 0 && (
                            <div className="card" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <AlertCircle size={20} color="#F59E0B" />
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-900)' }}>
                                        Areas for Improvement
                                    </h3>
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {candidate.interviewResult.weaknesses.map((weakness, index) => (
                                        <li key={index} style={{
                                            padding: '0.75rem',
                                            marginBottom: '0.5rem',
                                            background: '#FEF3C7',
                                            borderLeft: '3px solid #F59E0B',
                                            borderRadius: '0.25rem',
                                            color: 'var(--gray-700)',
                                            fontSize: '0.875rem'
                                        }}>
                                            {weakness}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                        <Link
                            to={`/dashboard/candidates/${candidate._id}/report`}
                            className="btn btn-primary"
                        >
                            <FileText size={16} />
                            View Full Report
                        </Link>
                        <Link
                            to="/dashboard/candidates"
                            className="btn btn-secondary"
                        >
                            Back to Candidates
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
