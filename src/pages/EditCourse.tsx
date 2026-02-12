import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, ArrowRight, Loader, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { showToast } from '../utils/toast';

export default function EditCourse() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [courseDetails, setCourseDetails] = useState({
        title: '',
        category: '',
        duration: '',
        level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
        prerequisites: '',
        description: '',
        contextFileContent: ''
    });

    useEffect(() => {
        fetchCourseDetails();
    }, [id]);

    const fetchCourseDetails = async () => {
        setLoading(true);
        try {
            const data = await api.courses.getById(id!);
            setCourseDetails({
                title: data.title || '',
                category: data.category || '',
                duration: data.duration || '',
                level: data.level || 'beginner',
                prerequisites: data.prerequisites || '',
                description: data.description || '',
                contextFileContent: data.contextFileContent || ''
            });
        } catch (error) {
            console.error('Failed to fetch course:', error);
            showToast.error('Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setUploading(true);

        try {
            const response = await api.jobs.parseDescription(file);

            if (response && response.text) {
                setCourseDetails(prev => ({
                    ...prev,
                    contextFileContent: response.text
                }));
                showToast.success('File uploaded and parsed successfully!');
            }
        } catch (err: any) {
            console.error('Failed to parse file:', err);
            setError(err.message || 'Failed to parse file. Please try a different format.');
            showToast.error('Failed to parse file');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleUpdateCourse = async () => {
        // Validate required fields
        if (!courseDetails.title.trim()) {
            setError('Course title is required');
            return;
        }
        if (!courseDetails.category.trim()) {
            setError('Category is required');
            return;
        }
        if (!courseDetails.duration.trim()) {
            setError('Duration is required');
            return;
        }
        if (!courseDetails.description.trim()) {
            setError('Course description is required');
            return;
        }

        try {
            setUploading(true);
            setError(null);

            await api.courses.update(id!, courseDetails);
            showToast.success('Course updated successfully!');
            navigate('/dashboard/courses');

        } catch (err: any) {
            console.error('Failed to update course:', err);
            setError(err.message || 'Failed to update course');
            showToast.error(err.message || 'Failed to update course');
        } finally {
            setUploading(false);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Loader size={48} className="animate-spin" style={{ color: 'var(--primary-600)' }} />
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', width: '100%', minHeight: '100vh' }}>
            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt"
                style={{ display: 'none' }}
            />

            <div style={{ maxWidth: '700px' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <button
                        onClick={() => navigate('/dashboard/courses')}
                        className="btn btn-ghost btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}
                    >
                        <ArrowLeft size={16} />
                        Back to Courses
                    </button>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--gray-900)' }}>Edit Course</h1>
                    <p style={{ color: 'var(--gray-500)' }}>Update the course details</p>
                </div>

                {error && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem',
                        color: '#DC2626',
                        fontSize: '0.875rem'
                    }}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <div className="card" style={{ padding: '2rem', background: 'var(--white)' }}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleUpdateCourse();
                        }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                    >
                        <div>
                            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                                Course Name <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                className="input"
                                style={{ background: 'var(--white)', color: 'var(--gray-900)', borderColor: 'var(--gray-300)' }}
                                value={courseDetails.title}
                                onChange={(e) => setCourseDetails(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g., Advanced Career Planning"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                                    Category <span style={{ color: '#EF4444' }}>*</span>
                                </label>
                                <select
                                    className="input"
                                    style={{ background: 'var(--white)', color: 'var(--gray-900)', borderColor: 'var(--gray-300)' }}
                                    value={courseDetails.category}
                                    onChange={(e) => setCourseDetails(prev => ({ ...prev, category: e.target.value }))}
                                >
                                    <option value="">Select Category</option>
                                    <option value="Career Guidance">Career Guidance</option>
                                    <option value="Soft Skills">Soft Skills</option>
                                    <option value="Technical Skills">Technical Skills</option>
                                    <option value="Communication">Communication</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                                    Duration <span style={{ color: '#EF4444' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    style={{ background: 'var(--white)', color: 'var(--gray-900)', borderColor: 'var(--gray-300)' }}
                                    value={courseDetails.duration}
                                    onChange={(e) => setCourseDetails(prev => ({ ...prev, duration: e.target.value }))}
                                    placeholder="e.g., 4 Weeks"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                                    Difficulty Level
                                </label>
                                <select
                                    className="input"
                                    style={{ background: 'var(--white)', color: 'var(--gray-900)', borderColor: 'var(--gray-300)' }}
                                    value={courseDetails.level}
                                    onChange={(e) => setCourseDetails(prev => ({ ...prev, level: e.target.value as any }))}
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                                    Prerequisites
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    style={{ background: 'var(--white)', color: 'var(--gray-900)', borderColor: 'var(--gray-300)' }}
                                    value={courseDetails.prerequisites}
                                    onChange={(e) => setCourseDetails(prev => ({ ...prev, prerequisites: e.target.value }))}
                                    placeholder="e.g., Basic English, Grade 10 Math"
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                                Description <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <textarea
                                className="input"
                                style={{ background: 'var(--white)', color: 'var(--gray-900)', borderColor: 'var(--gray-300)', resize: 'vertical' }}
                                value={courseDetails.description}
                                onChange={(e) => setCourseDetails(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Enter the full course description..."
                                rows={6}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                                Context File (Syllabus/Curriculum)
                            </label>
                            <div
                                onClick={() => !uploading && handleUploadClick()}
                                style={{
                                    border: '2px dashed var(--gray-300)',
                                    borderRadius: '0.5rem',
                                    padding: '1.5rem',
                                    textAlign: 'center',
                                    cursor: uploading ? 'wait' : 'pointer',
                                    background: uploading ? 'var(--gray-50)' : (courseDetails.contextFileContent ? 'var(--primary-50)' : 'transparent'),
                                    borderColor: uploading ? 'var(--gray-300)' : (courseDetails.contextFileContent ? 'var(--primary-300)' : 'var(--gray-300)'),
                                    opacity: uploading ? 0.7 : 1
                                }}
                            >
                                {uploading ? (
                                    <Loader size={24} className="animate-spin" style={{ color: 'var(--primary-600)', marginBottom: '0.5rem' }} />
                                ) : (
                                    <Upload size={24} style={{ color: 'var(--primary-600)', marginBottom: '0.5rem' }} />
                                )}
                                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                    {uploading ? 'Parsing File...' : (courseDetails.contextFileContent ? '✅ File Uploaded & Content Extracted' : 'Click to upload syllabus for better AI context')}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate('/dashboard/courses')}
                                disabled={uploading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={uploading}
                                style={{ flex: 1 }}
                            >
                                {uploading ? (
                                    <>
                                        <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                        Updating Course...
                                    </>
                                ) : (
                                    <>
                                        Update Course
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
