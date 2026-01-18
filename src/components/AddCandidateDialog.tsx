import { useState, useEffect, useRef } from 'react';
import { X, User, Mail, Phone, Linkedin, Briefcase, Loader, Upload, FileText } from 'lucide-react';
import api from '../services/api';

interface AddCandidateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    selectedJobId?: string | null;
}

export default function AddCandidateDialog({ isOpen, onClose, onSuccess, selectedJobId }: AddCandidateDialogProps) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        linkedInUrl: '',
        jobId: selectedJobId || '',
        experience: '',
    });

    const [jobs, setJobs] = useState<Array<{ _id: string; title: string }>>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [parsing, setParsing] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            loadJobs();
            // Pre-select job if provided, otherwise default to empty
            setFormData(prev => ({
                ...prev,
                jobId: selectedJobId || ''
            }));
        }
    }, [isOpen, selectedJobId]);

    const loadJobs = async () => {
        try {
            const data = await api.jobs.getAll();
            setJobs(data || []);
        } catch (err) {
            console.error('Failed to load jobs:', err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadedFile(file);
        setParsing(true);
        setError('');

        try {
            const result = await api.candidates.parseResume(file);

            if (result.success && result.data) {
                // Auto-populate form with extracted data
                setFormData(prev => ({
                    ...prev,
                    firstName: result.data.firstName || prev.firstName,
                    lastName: result.data.lastName || prev.lastName,
                    email: result.data.email || prev.email,
                    phone: result.data.phone || prev.phone,
                    experience: result.data.experience || prev.experience,
                }));
            }
        } catch (err: any) {
            console.error('Failed to parse resume:', err);
            let errorMessage = err.message || 'Failed to parse resume. Please fill in the details manually.';
            if (err.details) {
                errorMessage += `\n• ${err.details}`;
            }
            if (err.suggestion) {
                errorMessage += `\n\n💡 ${err.suggestion}`;
            }
            setError(errorMessage);
        } finally {
            setParsing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.candidates.create({
                ...formData,
                skipInvite: true
            });
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                linkedInUrl: '',
                jobId: '',
                experience: '',
            });
            setUploadedFile(null);
        } catch (err: any) {
            console.error('Failed to create candidate:', err);
            setError(err.message || 'Failed to create candidate');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Add Candidate</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={20} color="#6B7280" />
                    </button>
                </div>

                {error && (
                    <div style={{
                        padding: '0.75rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '0.375rem',
                        color: '#DC2626',
                        fontSize: '0.875rem',
                        marginBottom: '1rem',
                        whiteSpace: 'pre-wrap'
                    }}>
                        {error}
                    </div>
                )}

                {/* Resume Upload Section */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label className="label">Upload Resume (Optional)</label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            border: '2px dashed var(--gray-300)',
                            borderRadius: '0.5rem',
                            padding: '1rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            background: uploadedFile ? 'rgba(16, 185, 129, 0.05)' : 'var(--gray-50)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#E91E63';
                            e.currentTarget.style.background = 'rgba(233, 30, 99, 0.02)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--gray-300)';
                            e.currentTarget.style.background = uploadedFile ? 'rgba(16, 185, 129, 0.05)' : 'var(--gray-50)';
                        }}
                    >
                        {parsing ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <Loader size={20} color="#E91E63" style={{ animation: 'spin 1s linear infinite' }} />
                                <span style={{ fontSize: '0.875rem', color: '#E91E63' }}>Parsing resume...</span>
                            </div>
                        ) : uploadedFile ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <FileText size={20} color="#10B981" />
                                <span style={{ fontSize: '0.875rem', color: '#10B981', fontWeight: 500 }}>{uploadedFile.name}</span>
                            </div>
                        ) : (
                            <>
                                <Upload size={24} color="#9CA3AF" style={{ marginBottom: '0.5rem' }} />
                                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                                    Click to upload resume
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                    PDF, DOC, or DOCX (Auto-fills form)
                                </p>
                            </>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label className="label">First Name *</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} color="#9CA3AF" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text"
                                    name="firstName"
                                    className="input"
                                    required
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    style={{ paddingLeft: '36px' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="label">Last Name *</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} color="#9CA3AF" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text"
                                    name="lastName"
                                    className="input"
                                    required
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    style={{ paddingLeft: '36px' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label">Email Address *</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} color="#9CA3AF" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="email"
                                name="email"
                                className="input"
                                required
                                placeholder="john.doe@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                style={{ paddingLeft: '36px' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label">Job Position *</label>
                        <div style={{ position: 'relative' }}>
                            <Briefcase size={16} color="#9CA3AF" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                            <select
                                name="jobId"
                                className="input"
                                required
                                value={formData.jobId}
                                onChange={handleChange}
                                style={{ paddingLeft: '36px' }}
                            >
                                <option value="">Select a job...</option>
                                {jobs.map(job => (
                                    <option key={job._id} value={job._id}>{job.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label">Experience *</label>
                        <div style={{ position: 'relative' }}>
                            <Briefcase size={16} color="#9CA3AF" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                name="experience"
                                className="input"
                                required
                                placeholder="e.g., 3 years, 5+ years, Fresher"
                                value={formData.experience}
                                onChange={handleChange}
                                style={{ paddingLeft: '36px' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label">Phone Number (Optional)</label>
                        <div style={{ position: 'relative' }}>
                            <Phone size={16} color="#9CA3AF" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="tel"
                                name="phone"
                                className="input"
                                placeholder="+1 (555) 000-0000"
                                value={formData.phone}
                                onChange={handleChange}
                                style={{ paddingLeft: '36px' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label">LinkedIn URL (Optional)</label>
                        <div style={{ position: 'relative' }}>
                            <Linkedin size={16} color="#9CA3AF" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="url"
                                name="linkedInUrl"
                                className="input"
                                placeholder="https://linkedin.com/in/johndoe"
                                value={formData.linkedInUrl}
                                onChange={handleChange}
                                style={{ paddingLeft: '36px' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={onClose}
                            disabled={loading || parsing}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || parsing}
                        >
                            {loading ? (
                                <>
                                    <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                    Saving...
                                </>
                            ) : (
                                'Add Candidate'
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
