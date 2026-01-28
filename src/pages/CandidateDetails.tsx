import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    User, Mail, Phone, Linkedin, Briefcase, Calendar,
    FileText, Download, ChevronLeft, Save, CheckCircle
} from 'lucide-react';
import api from '../services/api';
import { showToast } from '../utils/toast';

interface Candidate {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    linkedInUrl?: string;
    experience?: string;
    resume?: {
        url: string;
        fileName: string;
    };
    resumeUrl?: string; // Legacy support
    status: string;
    createdAt: string;
    jobId: {
        _id: string;
        title: string;
        department?: string;
    } | string;
    job?: { // Additional compatibility
        _id: string;
        title: string;
    };
    interviewResult?: {
        overallScore?: number;
        recommendation?: string;
        summary?: string;
    };
    additionalNotes?: string;
}

export default function CandidateDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [editedCandidate, setEditedCandidate] = useState<Partial<Candidate>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fullName, setFullName] = useState('');
    const [showPdf, setShowPdf] = useState(false);

    useEffect(() => {
        if (id) {
            loadCandidate(id);
        }
    }, [id]);

    const loadCandidate = async (candidateId: string) => {
        try {
            setLoading(true);
            const data = await api.candidates.getById(candidateId);
            setCandidate(data);
            setEditedCandidate(data);
            setFullName(`${data.firstName || ''} ${data.lastName || ''}`.trim());
        } catch (err) {
            console.error('Failed to load candidate:', err);
            showToast.error('Failed to load candidate details');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof Candidate, value: string) => {
        setEditedCandidate(prev => ({ ...prev, [field]: value }));
    };

    const handleNameChange = (val: string) => {
        setFullName(val);
        const parts = val.trimStart().split(' ');
        const firstName = parts[0] || '';
        const lastName = parts.slice(1).join(' ') || '';
        setEditedCandidate(prev => ({ ...prev, firstName, lastName }));
    };

    const handleSave = async () => {
        if (!candidate?._id) return;
        try {
            setSaving(true);
            const updatedCandidate = await api.candidates.update(candidate._id, editedCandidate);
            showToast.success('Candidate details updated successfully');

            // Update local state with the response from server to ensure sync
            // We preserve jobId from the previous state because the update response might return it as a string (unpopulated)
            // while we want to keep the populated object for display purposes.
            setCandidate(prev => prev ? {
                ...prev,
                ...updatedCandidate,
                jobId: prev.jobId // Preserve populated job details
            } as Candidate : null);

            // Also update edited state to match what was actually saved (e.g. if backend ignored empty required fields)
            setEditedCandidate(prev => ({
                ...prev,
                ...updatedCandidate,
                jobId: prev.jobId
            }));

            const newFirst = updatedCandidate.firstName || editedCandidate.firstName || '';
            const newLast = updatedCandidate.lastName || editedCandidate.lastName || '';
            setFullName(`${newFirst} ${newLast}`.trim());

        } catch (err: any) {
            console.error('Failed to save candidate:', err);
            showToast.error(err.message || 'Failed to update candidate details');
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'interview_complete': return { bg: '#ECFDF5', text: '#059669', border: '#10B981' };
            case 'ai_analysis_ready': return { bg: '#FDF2F8', text: '#E91E63', border: '#F472B6' };
            case 'pending_interview': return { bg: '#FFFBEB', text: '#D97706', border: '#F59E0B' };
            case 'invited': return { bg: '#EFF6FF', text: '#3B82F6', border: '#60A5FA' };
            case 'new': return { bg: '#EFF6FF', text: '#3B82F6', border: '#60A5FA' };
            default: return { bg: '#F3F4F6', text: '#6B7280', border: '#9CA3AF' };
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!candidate) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#374151' }}>Candidate Not Found</h2>
                <Link to="/dashboard/candidates" className="btn btn-primary">Back to Candidates</Link>
            </div>
        );
    }

    const statusStyle = getStatusColor(candidate.status);
    const jobTitle = typeof candidate.jobId === 'object' ? candidate.jobId.title : (candidate.job?.title || 'Unknown Job');
    const jobId = typeof candidate.jobId === 'object' ? candidate.jobId._id : (candidate.job?._id || candidate.jobId);

    // Construct proper resume URL
    const resumeUrl = candidate.resume?.url || candidate.resumeUrl;


    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>
            {/* Back Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => navigate('/dashboard/candidates')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--gray-600)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.95rem'
                    }}
                >
                    <ChevronLeft size={20} /> Back to Candidates
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Header User Card */}
            <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    flexShrink: 0,
                    boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
                }}>
                    {editedCandidate.firstName?.[0]}{editedCandidate.lastName?.[0]}
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ width: '100%' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="Full Name"
                                    className="input"
                                    style={{ fontSize: '1.5rem', fontWeight: 700, width: '100%' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    backgroundColor: statusStyle.bg,
                                    color: statusStyle.text,
                                    border: `1px solid ${statusStyle.border}`,
                                    borderRadius: '9999px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    textTransform: 'capitalize'
                                }}>
                                    {candidate.status.replace('_', ' ')}
                                </span>
                                <span style={{ color: 'var(--gray-400)' }}>|</span>
                                <span style={{ color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Calendar size={16} /> Added on {new Date(candidate.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                            {(candidate.status === 'ai_analysis_ready' || candidate.status === 'interview_complete') && (
                                <Link to={`/dashboard/candidates/${candidate._id}/report`} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FileText size={18} /> View Analysis Report
                                </Link>
                            )}
                            {candidate.status === 'new' && (
                                <Link to={`/dashboard/candidates/invite?candidateId=${candidate._id}`} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Mail size={18} /> Send Invite
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

                {/* Contact Information */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-800)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={20} color="#6366F1" /> Contact Details
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ background: '#EEF2FF', padding: '0.6rem', borderRadius: '8px' }}>
                                <Mail size={20} color="#4F46E5" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '0.2rem' }}>Email Address</p>
                                <input
                                    type="email"
                                    value={editedCandidate.email || ''}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="input"
                                    style={{ width: '100%', padding: '0.4rem' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ background: '#ECFDF5', padding: '0.6rem', borderRadius: '8px' }}>
                                <Phone size={20} color="#059669" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '0.2rem' }}>Phone Number</p>
                                <input
                                    type="text"
                                    value={editedCandidate.phone || ''}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder="N/A"
                                    className="input"
                                    style={{ width: '100%', padding: '0.4rem' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ background: '#EFF6FF', padding: '0.6rem', borderRadius: '8px' }}>
                                <Linkedin size={20} color="#0077B5" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '0.2rem' }}>LinkedIn Profile</p>
                                <input
                                    type="text"
                                    value={editedCandidate.linkedInUrl || ''}
                                    onChange={(e) => handleInputChange('linkedInUrl', e.target.value)}
                                    placeholder="LinkedIn URL"
                                    className="input"
                                    style={{ width: '100%', padding: '0.4rem' }}
                                />
                                {editedCandidate.linkedInUrl && (
                                    <a href={editedCandidate.linkedInUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#0077B5', marginTop: '0.25rem', display: 'inline-block' }}>
                                        Test Link
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Additional Notes */}
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ background: '#F3F4F6', padding: '0.6rem', borderRadius: '8px' }}>
                                <FileText size={20} color="#6B7280" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '0.2rem' }}>Additional Notes</p>
                                <textarea
                                    value={editedCandidate.additionalNotes || ''}
                                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                                    placeholder="Enter additional notes here..."
                                    className="textarea"
                                    style={{ width: '100%', padding: '0.4rem', minHeight: '80px', fontSize: '0.875rem' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Professional Info */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-800)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Briefcase size={20} color="#E91E63" /> Professional Info
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ minWidth: '100px', color: 'var(--gray-500)', fontSize: '0.9rem' }}>Job Role</div>
                            <div style={{ fontWeight: 500, color: 'var(--gray-900)' }}>
                                <Link to={`/dashboard/jobs/${jobId}/job-dna`} style={{ color: '#E91E63', textDecoration: 'none' }}>
                                    {jobTitle}
                                </Link>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ minWidth: '100px', color: 'var(--gray-500)', fontSize: '0.9rem' }}>Experience</div>
                            <div style={{ flex: 1 }}>
                                <input
                                    type="text"
                                    value={editedCandidate.experience || ''}
                                    onChange={(e) => handleInputChange('experience', e.target.value)}
                                    placeholder="e.g. 5 years"
                                    className="input"
                                    style={{ width: '100%', padding: '0.4rem' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ minWidth: '100px', color: 'var(--gray-500)', fontSize: '0.9rem', paddingTop: '0.4rem' }}>Resume</div>
                            <div>
                                {resumeUrl ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {(() => {
                                            let resumeName = 'Resume Document';

                                            // 1. Legacy filename
                                            if (candidate.resume?.fileName) {
                                                resumeName = candidate.resume.fileName;
                                            }
                                            // 2. Parsed from S3 Key or resumeUrl
                                            else {
                                                // Try S3 Key first
                                                const s3Key = (candidate as any).resumeS3Key;
                                                if (s3Key) {
                                                    const fileName = s3Key.split('/').pop() || s3Key;
                                                    // Remove UUID prefix
                                                    resumeName = fileName.replace(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}-/, '') || 'Resume Document';
                                                }
                                                // 3. Fallback: Extract from URL
                                                else if (resumeUrl) {
                                                    try {
                                                        const urlObj = new URL(resumeUrl);
                                                        const pathName = urlObj.pathname.split('/').pop();
                                                        if (pathName) {
                                                            resumeName = decodeURIComponent(pathName).replace(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}-/, '') || 'Resume Document';
                                                        }
                                                    } catch (e) { }
                                                }
                                            }

                                            return (
                                                <a
                                                    href={resumeUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        color: '#7C3AED', // Purple-600
                                                        textDecoration: 'none',
                                                        fontWeight: 500,
                                                        background: '#F3E8FF', // Purple-100
                                                        padding: '0.5rem 0.75rem',
                                                        borderRadius: '0.5rem',
                                                        border: '1px solid #E9D5FF', // Purple-200
                                                        maxWidth: '220px' // Constrain container width
                                                    }}
                                                >
                                                    <FileText size={16} style={{ flexShrink: 0 }} />
                                                    <span style={{
                                                        fontSize: resumeName.length > 25 ? '0.75rem' : '0.9rem',
                                                        maxWidth: '180px',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        display: 'block',
                                                        flexShrink: 1
                                                    }} title={resumeName}>
                                                        {resumeName}
                                                    </span>
                                                    <Download size={14} style={{ marginLeft: 'auto', flexShrink: 0, opacity: 0.6 }} />
                                                </a>
                                            );
                                        })()}
                                    </div>
                                ) : (
                                    <span style={{ color: 'var(--gray-400)', fontStyle: 'italic' }}>No resume uploaded</span>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* View Resume Button (Toggle) */}
                    {resumeUrl && (
                        <button
                            onClick={() => setShowPdf(!showPdf)}
                            className="btn btn-sm"
                            style={{
                                marginTop: '1rem',
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem',
                                backgroundColor: '#F3F4F6',
                                color: '#4B5563',
                                border: '1px solid #E5E7EB'
                            }}
                        >
                            <FileText size={16} />
                            {showPdf ? 'Hide Resume' : 'View Resume'}
                        </button>
                    )}
                </div>

            </div>

            {/* PDF Viewer - Toggled by button */}
            {showPdf && resumeUrl && (
                <div style={{ position: 'relative', padding: '0', marginTop: '1.5rem', overflow: 'hidden', height: '1200px', width: '100%', boxShadow: 'none', border: 'none', background: 'transparent' }}>
                    {resumeUrl.toLowerCase().includes('.pdf') ? (
                        <iframe
                            src={`${resumeUrl}#view=FitH`}
                            title="Resume PDF"
                            scrolling="no"
                            style={{
                                position: 'absolute',
                                top: '-60px',
                                left: '0',
                                width: '100%',
                                height: 'calc(100% + 60px)',
                                border: 'none'
                            }}
                        />
                    ) : (
                        <iframe
                            src={`https://docs.google.com/gview?url=${encodeURIComponent(resumeUrl)}&embedded=true`}
                            title="Resume Viewer"
                            style={{ width: '100%', height: '100%', border: 'none' }}
                        />
                    )}
                </div>
            )}

            {candidate.interviewResult && (
                <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem', borderLeft: '4px solid #8B5CF6' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-800)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={20} color="#8B5CF6" /> Interview Result
                    </h3>
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        <div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>Overall Score</p>
                            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#8B5CF6' }}>{candidate.interviewResult.overallScore}%</p>
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>Recommendation</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--gray-900)' }}>{candidate.interviewResult.recommendation}</p>
                        </div>
                        {candidate.interviewResult.summary && (
                            <div style={{ flexBasis: '100%', marginTop: '0.5rem' }}>
                                <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>Summary</p>
                                <p style={{ fontSize: '1rem', color: 'var(--gray-700)', lineHeight: '1.5' }}>{candidate.interviewResult.summary}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
