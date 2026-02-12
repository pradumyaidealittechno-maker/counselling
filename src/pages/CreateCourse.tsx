import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader, AlertCircle, PenTool, Music, Upload, FileText, X, File, Dna } from 'lucide-react';
import api from '../services/api';
import { showToast } from '../utils/toast';

export default function CreateCourse() {
    const navigate = useNavigate();
    const audioInputRef = useRef<HTMLInputElement>(null);
    const resourceInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [audioUploading, setAudioUploading] = useState(false);
    const [resourceUploading, setResourceUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDetailsForm, setShowDetailsForm] = useState(false);

    const [courseDetails, setCourseDetails] = useState({
        title: '',
        category: '',
        duration: '',
        level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
        prerequisites: '',
        description: '',
        audioUrl: '',
        resources: [] as Array<{ name: string; url: string }>
    });

    const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('audio/')) {
            showToast.error('Please upload a valid audio file');
            return;
        }

        setError(null);
        setAudioUploading(true);

        try {
            const result = await api.upload.file(file, 'course-audio');
            if (result && result.url) {
                const fileName = file.name.replace(/\.[^/.]+$/, '').replace(/-/g, ' ');
                setCourseDetails(prev => ({
                    ...prev,
                    title: prev.title || fileName || 'Counselling Session',
                    audioUrl: result.url
                }));
                setShowDetailsForm(true);
                showToast.success('Audio file uploaded successfully!');
            }
        } catch (err: any) {
            console.error('Failed to upload audio:', err);
            showToast.error('Failed to upload audio file');
        } finally {
            setAudioUploading(false);
            if (audioInputRef.current) audioInputRef.current.value = '';
        }
    };

    const handleResourceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setResourceUploading(true);
        setError(null);

        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                const result = await api.upload.file(file, 'course-resource');
                return { name: file.name, url: result.url };
            });

            const uploadedResources = await Promise.all(uploadPromises);
            setCourseDetails(prev => ({
                ...prev,
                resources: [...prev.resources, ...uploadedResources]
            }));
            showToast.success(`${uploadedResources.length} file(s) uploaded successfully!`);
        } catch (err: any) {
            console.error('Failed to upload resources:', err);
            showToast.error('Some files failed to upload');
        } finally {
            setResourceUploading(false);
            if (resourceInputRef.current) resourceInputRef.current.value = '';
        }
    };

    const removeResource = (index: number) => {
        setCourseDetails(prev => ({
            ...prev,
            resources: prev.resources.filter((_, i) => i !== index)
        }));
    };

    const handleCreateCourse = async () => {
        if (!courseDetails.title.trim() || !courseDetails.category.trim() || !courseDetails.duration.trim() || !courseDetails.description.trim()) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setUploading(true);
            setError(null);

            const course = await api.courses.create(courseDetails);
            showToast.success('Course created successfully!');

            // Navigate to Course DNA Training page
            navigate(`/dashboard/courses/${course._id}/course-dna`);

        } catch (err: any) {
            console.error('Failed to create course:', err);
            setError(err.message || 'Failed to create course');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', width: '100%', minHeight: '100vh' }}>
            <input
                type="file"
                ref={audioInputRef}
                onChange={handleAudioUpload}
                accept="audio/*"
                style={{ display: 'none' }}
            />
            <input
                type="file"
                ref={resourceInputRef}
                onChange={handleResourceUpload}
                accept=".pdf,.doc,.docx,.txt"
                multiple
                style={{ display: 'none' }}
            />

            {!showDetailsForm ? (
                <>
                    <div style={{ marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--gray-900)' }}>Create New Course</h1>
                        <p style={{ color: 'var(--gray-500)' }}>Choose how you want to create your course recommendation</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '900px' }}>
                        <div
                            className="card card-hover"
                            style={{
                                padding: '2.5rem',
                                border: '2px dashed var(--gray-200)',
                                textAlign: 'center',
                                cursor: audioUploading ? 'wait' : 'pointer',
                                borderRadius: '1rem',
                                backgroundColor: 'white'
                            }}
                            onClick={() => !audioUploading && audioInputRef.current?.click()}
                        >
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                                borderRadius: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem'
                            }}>
                                {audioUploading ? <Loader size={36} color="#10b981" className="animate-spin" /> : <Music size={36} color="#10b981" />}
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--gray-900)' }}>Upload Counselling Audio</h3>
                            <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>Auto-fill course details from conversation</p>
                            <button className="btn btn-primary" style={{ background: '#10b981', borderColor: '#10b981' }} disabled={audioUploading}>
                                {audioUploading ? 'Uploading...' : 'Upload Audio'} <ArrowRight size={18} />
                            </button>
                        </div>

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
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--gray-900)' }}>Create Manually</h3>
                            <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>Fill in details and upload resources manually</p>
                            <button className="btn btn-secondary">Start from Scratch <ArrowRight size={18} /></button>
                        </div>
                    </div>
                </>
            ) : (
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--gray-900)' }}>Course Details</h1>
                        <p style={{ color: 'var(--gray-500)' }}>Complete details & upload resources to generate Course DNA</p>
                    </div>

                    {error && (
                        <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.5rem', marginBottom: '1.5rem', color: '#DC2626', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div className="card" style={{ padding: '2.5rem', background: 'var(--white)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        <form onSubmit={(e) => { e.preventDefault(); handleCreateCourse(); }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--gray-700)' }}>Course Name <span style={{ color: '#EF4444' }}>*</span></label>
                                <input type="text" className="input" value={courseDetails.title} onChange={(e) => setCourseDetails(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g., Advanced Career Planning" />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--gray-700)' }}>Category <span style={{ color: '#EF4444' }}>*</span></label>
                                    <select className="input" value={courseDetails.category} onChange={(e) => setCourseDetails(prev => ({ ...prev, category: e.target.value }))}>
                                        <option value="">Select Category</option>
                                        <option value="Career Guidance">Career Guidance</option>
                                        <option value="Soft Skills">Soft Skills</option>
                                        <option value="Technical Skills">Technical Skills</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--gray-700)' }}>Duration <span style={{ color: '#EF4444' }}>*</span></label>
                                    <input type="text" className="input" value={courseDetails.duration} onChange={(e) => setCourseDetails(prev => ({ ...prev, duration: e.target.value }))} placeholder="e.g., 4 Weeks" />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--gray-700)' }}>Description <span style={{ color: '#EF4444' }}>*</span></label>
                                <textarea className="input" value={courseDetails.description} onChange={(e) => setCourseDetails(prev => ({ ...prev, description: e.target.value }))} rows={5} placeholder="Describe the course content and objectives..." />
                            </div>

                            <div>
                                <label style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--gray-700)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FileText size={18} /> Course Resources & Syllabus
                                </label>
                                <div
                                    onClick={() => !resourceUploading && resourceInputRef.current?.click()}
                                    style={{ border: '2px dashed var(--gray-300)', borderRadius: '0.5rem', padding: '1.5rem', textAlign: 'center', cursor: resourceUploading ? 'wait' : 'pointer', background: 'var(--gray-50)', marginBottom: '1rem' }}
                                >
                                    {resourceUploading ? <Loader size={24} className="animate-spin" color="var(--primary-600)" /> : <Upload size={24} color="var(--primary-600)" />}
                                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginTop: '0.5rem' }}>
                                        {resourceUploading ? 'Uploading Files...' : 'Click to upload syllabus or learning materials (Multiple supported)'}
                                    </p>
                                </div>

                                {courseDetails.resources.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {courseDetails.resources.map((res, idx) => (
                                            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                                    <File size={16} color="var(--gray-400)" />
                                                    <span style={{ color: 'var(--gray-700)' }}>{res.name}</span>
                                                </div>
                                                <button type="button" onClick={() => removeResource(idx)} style={{ color: 'var(--gray-400)', border: 'none', background: 'none', cursor: 'pointer' }}><X size={16} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailsForm(false)} disabled={uploading}>Back</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)' }} disabled={uploading || resourceUploading}>
                                    {uploading ? <><Loader size={18} className="animate-spin" /> Creating...</> : <><Dna size={18} /> Create & Generate DNA <ArrowRight size={18} /></>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
}
