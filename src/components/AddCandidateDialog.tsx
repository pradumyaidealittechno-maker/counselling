import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Linkedin, Briefcase, Loader } from 'lucide-react';
import api from '../services/api';

interface AddCandidateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    selectedJobId?: string | null;
    initialData?: {
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        linkedIn?: string;
        experience?: string;
    };
}

export default function AddCandidateDialog({ isOpen, onClose, onSuccess, selectedJobId, initialData }: AddCandidateDialogProps) {
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

    useEffect(() => {
        if (isOpen) {
            loadJobs();
            // Pre-select job if provided, or use initialData if available
            setFormData(prev => ({
                ...prev,
                jobId: selectedJobId || '',
                firstName: initialData?.firstName || '',
                lastName: initialData?.lastName || '',
                email: initialData?.email || '',
                phone: initialData?.phone || '',
                linkedInUrl: initialData?.linkedIn || '', // map linkedIn -> linkedInUrl
                experience: initialData?.experience || '',
                experience: initialData?.experience || '',
            }));
        }
    }, [isOpen, selectedJobId, initialData]);

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
                        marginBottom: '1rem'
                    }}>
                        {error}
                    </div>
                )}

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
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
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
