import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    GraduationCap,
    School,
    Mail,
    Phone,
    Calendar,
    FileText,
    Brain,
    Clock,
    Edit,
    Loader,
    Upload,
    Download,
    Trash2,
    ExternalLink
} from 'lucide-react';
import api from '../services/api';
import { showToast } from '../utils/toast';

interface StudentDocument {
    _id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
}

interface Student {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    currentGrade: string;
    currentSchool?: string;
    currentBoard?: string;
    academicYear?: string;
    status: string;
    createdAt: string;
    documents?: StudentDocument[];
    studentProfile?: {
        strengths: string[];
        weaknesses: string[];
        interests: string[];
    };
}

export default function StudentProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchStudent();
    }, [id]);

    const fetchStudent = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await api.students.getById(id);
            setStudent(data);
        } catch (error) {
            console.error('Failed to fetch student:', error);
            showToast.error('Failed to load student profile');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !id) return;

        setUploading(true);
        try {
            const file = files[0];
            const uploadRes = await api.upload.file(file, 'student_docs');

            // Add document info to student record
            const newDoc = {
                name: file.name,
                type: file.type.split('/')[1] || 'document',
                url: uploadRes.url
            };

            const updatedStudent = await api.students.update(id, {
                documents: [...(student?.documents || []), newDoc]
            });

            setStudent(updatedStudent);
            showToast.success('Document uploaded successfully');
        } catch (error: any) {
            console.error('Upload failed:', error);
            showToast.error(error.message || 'Failed to upload document');
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleDeleteDoc = async (docId: string) => {
        if (!id || !student || !window.confirm('Are you sure you want to delete this document?')) return;

        try {
            const updatedDocs = student.documents?.filter(d => d._id !== docId);
            const updatedStudent = await api.students.update(id, {
                documents: updatedDocs
            });
            setStudent(updatedStudent);
            showToast.success('Document deleted');
        } catch (error) {
            showToast.error('Failed to delete document');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--gray-500)', gap: '0.5rem' }}>
                <Loader className="animate-spin" size={24} /> Loading Profile...
            </div>
        );
    }

    if (!student) {
        return <div>Student not found.</div>;
    }

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
            {/* Header & Back */}
            <div>
                <button
                    onClick={() => navigate('/dashboard/students')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', marginBottom: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <ArrowLeft size={20} /> Back to Students
                </button>

                <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 600, color: 'var(--primary-700)' }}>
                            {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                                {student.firstName} {student.lastName}
                            </h1>
                            <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                    <Mail size={16} /> {student.email}
                                </span>
                                {student.phone && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                        <Phone size={16} /> {student.phone}
                                    </span>
                                )}

                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                    <GraduationCap size={16} /> {student.currentGrade}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                        <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '1rem',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            background: student.status === 'active' ? 'var(--success-50)' : 'var(--gray-100)',
                            color: student.status === 'active' ? 'var(--success-700)' : 'var(--gray-600)'
                        }}>
                            {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </span>
                        <button className="btn btn-outline btn-sm" style={{ display: 'flex', gap: '0.5rem' }}>
                            <Edit size={16} /> Edit Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)', marginBottom: '1.5rem' }}>
                    {['Overview', 'Documents', 'AI Analysis', 'Career Guidance', 'Sessions'].map(tab => {
                        const key = tab.toLowerCase().replace(' ', '');
                        return (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activeTab === key ? '2px solid var(--primary-600)' : '2px solid transparent',
                                    color: activeTab === key ? 'var(--primary-700)' : 'var(--gray-500)',
                                    fontWeight: activeTab === key ? 600 : 500,
                                    cursor: 'pointer',
                                    fontSize: '0.925rem'
                                }}
                            >
                                {tab}
                            </button>
                        )
                    })}
                </div>

                {/* Content Area */}
                <div style={{ minHeight: '400px' }}>
                    {activeTab === 'overview' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Academic Details */}
                                <div className="card">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <School size={20} className="text-blue-500" /> Academic Details
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">School Name</p>
                                            <p className="font-medium text-gray-900">{student.currentSchool || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Board/University</p>
                                            <p className="font-medium text-gray-900">{student.currentBoard || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Grade/Year</p>
                                            <p className="font-medium text-gray-900">{student.currentGrade}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Academic Year</p>
                                            <p className="font-medium text-gray-900">{student.academicYear || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity Placeholder */}
                                <div className="card">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Clock size={20} className="text-orange-500" /> Recent Activity
                                    </h3>
                                    <p className="text-gray-500 italic">No recent activity recorded.</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Quick Actions */}
                                <div className="card">
                                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                                    <div className="flex flex-col gap-2">
                                        <button className="btn btn-outline w-full justify-start" onClick={() => navigate('/dashboard/sessions/schedule')}>
                                            <Calendar size={16} className="mr-2" /> Schedule Session
                                        </button>
                                        <label className="btn btn-outline w-full justify-start cursor-pointer">
                                            <Upload size={16} className="mr-2" />
                                            {uploading ? 'Uploading...' : 'Upload Document'}
                                            <input type="file" hidden onChange={handleFileUpload} disabled={uploading} />
                                        </label>
                                        <button className="btn btn-outline w-full justify-start" onClick={() => setActiveTab('aianalysis')}>
                                            <Brain size={16} className="mr-2" /> Run AI Analysis
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 className="text-xl font-bold">Student Documents</h3>
                                <label className="btn btn-primary btn-sm cursor-pointer">
                                    {uploading ? <Loader className="animate-spin mr-2" size={16} /> : <Upload size={16} className="mr-2" />}
                                    {uploading ? 'Uploading...' : 'Upload New'}
                                    <input type="file" hidden onChange={handleFileUpload} disabled={uploading} />
                                </label>
                            </div>

                            {student.documents && student.documents.length > 0 ? (
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {student.documents.map(doc => (
                                        <div key={doc._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--gray-50)', borderRadius: '0.75rem', border: '1px solid var(--gray-200)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ padding: '0.75rem', background: 'white', borderRadius: '0.5rem', color: 'var(--primary-600)' }}>
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <h4 style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{doc.name}</h4>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                                        Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()} • {doc.type.toUpperCase()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <a href={doc.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm btn-icon" title="View">
                                                    <ExternalLink size={18} />
                                                </a>
                                                <button onClick={() => handleDeleteDoc(doc._id)} className="btn btn-ghost btn-sm btn-icon text-error-600" title="Delete">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
                                    <Upload size={48} style={{ margin: '0 auto 1rem', color: 'var(--gray-300)' }} />
                                    <p>No documents uploaded yet.</p>
                                    <p style={{ fontSize: '0.875rem' }}>Upload transcripts, certificates or test results to build the student profile.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'aianalysis' && (
                        <div className="card text-center p-8">
                            <Brain size={48} className="mx-auto text-purple-200 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">AI Analysis Not Generated</h3>
                            <p className="text-gray-500 mb-6">Upload documents (transcripts, test scores) to generate a comprehensive student profile.</p>
                            <button className="btn btn-primary" onClick={() => setActiveTab('documents')}>Proceed to Document Upload</button>
                        </div>
                    )}
                    {activeTab === 'careerguidance' && <div className="card p-8 text-center text-gray-500">Career Guidance Coming Soon</div>}
                    {activeTab === 'sessions' && <div className="card p-8 text-center text-gray-500">Session History Coming Soon</div>}
                </div>
            </div>
        </div>
    );
}
