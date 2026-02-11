import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, BookOpen, ArrowRight, File, Loader, AlertCircle, PenTool } from 'lucide-react';

export default function CreateCourse() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDetailsForm, setShowDetailsForm] = useState(false);

    const [courseDetails, setCourseDetails] = useState({
        title: '',
        category: '',
        duration: '',
        level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
        prerequisites: '',
        description: ''
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        setUploading(true);

        // Mock parsing delay
        setTimeout(() => {
            setUploading(false);
            const fileName = file.name.replace(/\.[^/.]+$/, '').replace(/-/g, ' ');
            setCourseDetails(prev => ({
                ...prev,
                title: fileName || 'Uploaded Course',
                description: `Syllabus parsed from ${file.name}...\n\nCourse Overview: ...`
            }));
            setShowDetailsForm(true);
        }, 1500);
    };

    const handleCreateCourse = async () => {
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

            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Navigate to Recommendations page (or back to courses for now)
            // Since "Recommend to students" is requested, maybe navigate to a recommendations page?
            // For now, let's go to courses list with a success indicator?
            // Or maybe a "Course View" page?
            navigate('/dashboard/courses');

        } catch (err: any) {
            console.error('Failed to create course:', err);
            setError(err.message || 'Failed to create course');
        } finally {
            setUploading(false);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div>
            {!showDetailsForm ? (
                <>
                    <div style={{ marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--gray-900)' }}>Create New Course</h1>
                        <p style={{ color: 'var(--gray-500)' }}>Choose how you want to create your course curriculum</p>
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
                            fontSize: '0.875rem',
                            maxWidth: '900px'
                        }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.txt"
                        style={{ display: 'none' }}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '900px' }}>
                        {/* Upload Syllabus */}
                        <div
                            className="card card-hover"
                            style={{
                                padding: '2.5rem',
                                border: '2px dashed var(--gray-200)',
                                textAlign: 'center',
                                cursor: uploading ? 'wait' : 'pointer',
                                opacity: uploading ? 0.7 : 1,
                                borderRadius: '1rem',
                                backgroundColor: 'white'
                            }}
                            onClick={!uploading ? handleUploadClick : undefined}
                        >
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                                borderRadius: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem'
                            }}>
                                {uploading ? (
                                    <Loader size={36} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
                                ) : (
                                    <Upload size={36} color="#6366f1" />
                                )}
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--gray-900)' }}>
                                Upload Syllabus
                            </h3>
                            <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>Upload a PDF or DOC file to auto-generate course details</p>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                color: '#9ca3af',
                                fontSize: '0.875rem'
                            }}>
                                <File size={16} />
                                <span>PDF, DOC, DOCX supported</span>
                            </div>
                            <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} disabled={uploading}>
                                {uploading ? 'Uploading...' : 'Upload File'} <ArrowRight size={18} />
                            </button>
                        </div>

                        {/* Manual Creation */}
                        <div
                            className="card card-hover"
                            style={{
                                padding: '2.5rem',
                                border: '2px solid var(--gray-200)',
                                textAlign: 'center',
                                cursor: 'pointer',
                                borderRadius: '1rem',
                                backgroundColor: 'white'
                            }}
                            onClick={() => setShowDetailsForm(true)}
                        >
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
                                borderRadius: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem'
                            }}>
                                <PenTool size={36} color="#3b82f6" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--gray-900)' }}>
                                Create Manually
                            </h3>
                            <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
                                Fill in the course details, duration, and prerequisites manually
                            </p>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                color: '#9ca3af',
                                fontSize: '0.875rem'
                            }}>
                                <BookOpen size={16} />
                                <span>Full customization</span>
                            </div>
                            <button className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
                                Start from Scratch <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div style={{ maxWidth: '700px' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--gray-900)' }}>Course Details</h1>
                        <p style={{ color: 'var(--gray-500)' }}>Complete the course details to recommend to students</p>
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
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

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowDetailsForm(false);
                                        setError(null);
                                    }}
                                    disabled={uploading}
                                >
                                    Back
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleCreateCourse}
                                    disabled={uploading}
                                    style={{ flex: 1 }}
                                >
                                    {uploading ? (
                                        <>
                                            <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                            Saving Course...
                                        </>
                                    ) : (
                                        <>
                                            Save & Recommend
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
